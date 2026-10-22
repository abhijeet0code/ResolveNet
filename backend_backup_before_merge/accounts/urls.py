from django.urls import path
from .views import LogoutView, RegisterView, LoginView, CurrentUserView, ProfileView, ProfileAvatarUploadView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("me/", CurrentUserView.as_view(), name="current-user"),
    path("profile/",ProfileView.as_view(), name="profile"),
    path("profile/avatar/",ProfileAvatarUploadView.as_view(), name="profile"),
    path('logout/', LogoutView.as_view(), name='logout'),
]