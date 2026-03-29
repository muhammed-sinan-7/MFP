import InstagramEditor from "./InstagramEditor";
import LinkedInEditor from "./LinkedInEditor";
import YoutubeEditor from "./YouTubeEditor";

export default function PlatformEditor(props) {
  const { target } = props;

  switch (target.provider) {

    case "instagram":
      return <InstagramEditor {...props} />;

    case "linkedin":
      return <LinkedInEditor {...props} />;

    case "youtube":
      return <YoutubeEditor {...props} />;

    default:
      return null;
  }
}