from django.urls import include, path

urlpatterns = [path("", include("apps.support.api.urls"))]

