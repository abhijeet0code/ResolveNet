from django.urls import path
from .views import RegisterView, LoginView, CurrentUserView, ProfileView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("me/", CurrentUserView.as_view(), name="current-user"),
    path("profile/",ProfileView.as_view(), name="profile"),
]