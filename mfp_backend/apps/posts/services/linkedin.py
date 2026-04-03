import requests
import time
from django.utils import timezone

from apps.posts.models import MediaType

from .base import BasePublisher


class LinkedInPublisher(BasePublisher):

    BASE_URL = "https://api.linkedin.com/v2"
    REST_BASE_URL = "https://api.linkedin.com/rest"
    REQUEST_TIMEOUT = 20
    LINKEDIN_VERSION = "202602"

    def _mark_account_reconnect_required(self, post_platform):
        social_account = post_platform.publishing_target.social_account
        social_account.is_active = False
        social_account.token_expires_at = timezone.now()
        social_account.save(update_fields=["is_active", "token_expires_at"])
        social_account.publishing_targets.update(is_active=False)

    def _raise_for_linkedin_error(self, response, action, post_platform=None):
        if response.status_code in [200, 201, 202]:
            return

        try:
            payload = response.json()
        except ValueError:
            payload = {"message": response.text[:300]}

        message = str(payload)

        # LinkedIn can revoke tokens before our stored expiry timestamp.
        if response.status_code in [401, 403] or "INVALID_ACCESS_TOKEN" in message:
            if post_platform is not None:
                self._mark_account_reconnect_required(post_platform)
            raise Exception(
                "LinkedIn access token expired or was revoked. Please reconnect your LinkedIn account."
            )

        raise Exception(f"{action}: {message}")

    def publish(self, post_platform):

        social_account = post_platform.publishing_target.social_account
        caption = post_platform.caption or ""

        if not social_account.access_token:
            raise Exception("Missing LinkedIn access token")

        if social_account.is_token_expired():
            raise Exception("LinkedIn token expired")

        access_token = social_account.access_token

        person_id = social_account.external_id
        author_urn = f"urn:li:person:{person_id}"
        media_items = list(post_platform.media.all().order_by("order"))
        image_items = [item for item in media_items if item.media_type == MediaType.IMAGE]
        video_items = [item for item in media_items if item.media_type == MediaType.VIDEO]

        if len(image_items) > 1:
            if video_items:
                raise Exception(
                    "LinkedIn multi-image posts do not support videos in the same post."
                )
            return self._publish_multi_image_post(
                image_items=image_items,
                access_token=access_token,
                author_urn=author_urn,
                caption=caption,
                post_platform=post_platform,
            )

        headers = {
            "Authorization": f"Bearer {access_token}",
            "X-Restli-Protocol-Version": "2.0.0",
            "Content-Type": "application/json",
        }

        image = image_items[0] if image_items else None
        video = video_items[0] if video_items else None

        if video:
            media_urn = self._upload_video(video.file, access_token, person_id)
            share_media_category = "VIDEO"

        elif image:
            media_urn = self._upload_image(image.file, access_token, person_id)
            share_media_category = "IMAGE"

        else:
            media_urn = None
            share_media_category = "NONE"

        payload = {
            "author": author_urn,
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {"text": caption},
                    "shareMediaCategory": share_media_category,
                }
            },
            "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
        }

        if media_urn:
            payload["specificContent"]["com.linkedin.ugc.ShareContent"]["media"] = [
                {
                    "status": "READY",
                    "media": media_urn,
                    "title": {"text": "Shared Image"},
                }
            ]

        print("FINAL PAYLOAD:", payload)

        response = requests.post(
            f"{self.BASE_URL}/ugcPosts",
            json=payload,
            headers=headers,
            timeout=self.REQUEST_TIMEOUT,
        )

        print("POST RESPONSE:", response.status_code, response.text)

        self._raise_for_linkedin_error(
            response,
            "LinkedIn publish failed",
            post_platform=post_platform,
        )

        return {"external_id": response.json().get("id")}

    def _publish_multi_image_post(
        self,
        *,
        image_items,
        access_token,
        author_urn,
        caption,
        post_platform,
    ):
        image_entries = []
        for image in image_items:
            image_urn = self._upload_rest_image(
                image.file,
                access_token,
                author_urn,
                post_platform=post_platform,
            )
            image_entries.append(
                {
                    "id": image_urn,
                    "altText": self._build_alt_text(image.file.name),
                }
            )

        payload = {
            "author": author_urn,
            "commentary": caption,
            "visibility": "PUBLIC",
            "distribution": {
                "feedDistribution": "MAIN_FEED",
                "targetEntities": [],
                "thirdPartyDistributionChannels": [],
            },
            "lifecycleState": "PUBLISHED",
            "isReshareDisabledByAuthor": False,
            "content": {
                "multiImage": {
                    "images": image_entries,
                }
            },
        }

        response = requests.post(
            f"{self.REST_BASE_URL}/posts",
            json=payload,
            headers=self._rest_headers(access_token),
            timeout=self.REQUEST_TIMEOUT,
        )

        self._raise_for_linkedin_error(
            response,
            "LinkedIn multi-image publish failed",
            post_platform=post_platform,
        )

        return {"external_id": self._extract_linkedin_id(response)}

    def _wait_for_asset_ready(self, asset, access_token):
        """
        LinkedIn's /v2/assets/{urn} status endpoint is unreliable.
        After a successful PUT upload the asset is ready within a few seconds.
        A short sleep is the standard approach for this legacy API.
        """
        print(f"[ASSET READY] Waiting 4s for asset to process: {asset}")
        time.sleep(4)

    def _rest_headers(self, access_token):
        return {
            "Authorization": f"Bearer {access_token}",
            "X-Restli-Protocol-Version": "2.0.0",
            "Linkedin-Version": self.LINKEDIN_VERSION,
            "Content-Type": "application/json",
        }

    def _upload_rest_image(self, file_field, access_token, author_urn, post_platform):
        initialize_payload = {
            "initializeUploadRequest": {
                "owner": author_urn,
            }
        }

        initialize_res = requests.post(
            f"{self.REST_BASE_URL}/images?action=initializeUpload",
            json=initialize_payload,
            headers=self._rest_headers(access_token),
            timeout=self.REQUEST_TIMEOUT,
        )

        self._raise_for_linkedin_error(
            initialize_res,
            "LinkedIn image initialize failed",
            post_platform=post_platform,
        )

        data = initialize_res.json().get("value", {})
        upload_url = data.get("uploadUrl")
        image_urn = data.get("image")

        if not upload_url or not image_urn:
            raise Exception("LinkedIn image initialize response was missing upload data.")

        file_field.open()
        file_bytes = file_field.read()
        file_field.close()

        upload_res = requests.put(
            upload_url,
            data=file_bytes,
            headers={"Content-Type": "application/octet-stream"},
            timeout=self.REQUEST_TIMEOUT,
        )

        self._raise_for_linkedin_error(
            upload_res,
            "LinkedIn image upload failed",
            post_platform=post_platform,
        )

        self._wait_for_asset_ready(image_urn, access_token)
        return image_urn

    def _build_alt_text(self, file_name):
        if not file_name:
            return "LinkedIn post image"
        return file_name[:120]

    def _extract_linkedin_id(self, response):
        restli_id = response.headers.get("x-restli-id") or response.headers.get("X-RestLi-Id")
        if restli_id:
            return restli_id

        try:
            payload = response.json()
        except ValueError:
            return None

        return payload.get("id")

    def _upload_image(self, file_field, access_token, person_id):

        headers = {
            "Authorization": f"Bearer {access_token}",
            "X-Restli-Protocol-Version": "2.0.0",
            "Content-Type": "application/json",
        }

        register_payload = {
            "registerUploadRequest": {
                "recipes": ["urn:li:digitalmediaRecipe:feedshare-image"],
                "owner": f"urn:li:person:{person_id}",
                "serviceRelationships": [
                    {
                        "relationshipType": "OWNER",
                        "identifier": "urn:li:userGeneratedContent",
                    }
                ],
            }
        }

        register_res = requests.post(
            f"{self.BASE_URL}/assets?action=registerUpload",
            json=register_payload,
            headers=headers,
            timeout=self.REQUEST_TIMEOUT,
        )

        print("REGISTER IMAGE:", register_res.status_code, register_res.text)

        self._raise_for_linkedin_error(
            register_res,
            "LinkedIn image register failed",
            post_platform=file_field.instance.post_platform,
        )

        data = register_res.json()

        upload_url = data["value"]["uploadMechanism"][
            "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
        ]["uploadUrl"]
        asset = data["value"]["asset"]

        # ✅ S3-safe read
        file_field.open()
        file_bytes = file_field.read()
        file_field.close()

        upload_res = requests.put(
            upload_url,
            data=file_bytes,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/octet-stream",
            },
            timeout=self.REQUEST_TIMEOUT,
        )

        print("UPLOAD IMAGE:", upload_res.status_code, upload_res.text[:200])

        self._raise_for_linkedin_error(
            upload_res,
            "LinkedIn image upload failed",
            post_platform=file_field.instance.post_platform,
        )

        self._wait_for_asset_ready(asset, access_token)

        return asset

    def _upload_video(self, file_field, access_token, person_id):

        headers = {
            "Authorization": f"Bearer {access_token}",
            "X-Restli-Protocol-Version": "2.0.0",
            "Content-Type": "application/json",
        }

        register_payload = {
            "registerUploadRequest": {
                "recipes": ["urn:li:digitalmediaRecipe:feedshare-video"],
                "owner": f"urn:li:person:{person_id}",
                "serviceRelationships": [
                    {
                        "relationshipType": "OWNER",
                        "identifier": "urn:li:userGeneratedContent",
                    }
                ],
            }
        }

        register_res = requests.post(
            f"{self.BASE_URL}/assets?action=registerUpload",
            json=register_payload,
            headers=headers,
            timeout=self.REQUEST_TIMEOUT,
        )

        print("REGISTER VIDEO:", register_res.status_code, register_res.text)

        self._raise_for_linkedin_error(
            register_res,
            "LinkedIn video register failed",
            post_platform=file_field.instance.post_platform,
        )

        data = register_res.json()

        upload_url = data["value"]["uploadMechanism"][
            "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
        ]["uploadUrl"]
        asset = data["value"]["asset"]

        file_field.open()
        file_bytes = file_field.read()
        file_field.close()

        upload_res = requests.put(
            upload_url,
            data=file_bytes,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/octet-stream",
            },
            timeout=self.REQUEST_TIMEOUT,
        )

        print("UPLOAD VIDEO:", upload_res.status_code, upload_res.text[:200])

        self._raise_for_linkedin_error(
            upload_res,
            "LinkedIn video upload failed",
            post_platform=file_field.instance.post_platform,
        )

        self._wait_for_asset_ready(asset, access_token)

        return asset
