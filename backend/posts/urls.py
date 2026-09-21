from django.urls import path

from .views import PostCreateView, PostListView, MyPostsView

urlpatterns = [
    path("", PostListView.as_view(), name="post-list"),
    path("create/", PostCreateView.as_view(), name="post-create"),
    path("mine/", MyPostsView.as_view(), name="post-mine"),
]