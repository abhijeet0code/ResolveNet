from django.urls import path

from .views import (
    PostListView,
    PostCreateView,
    MyPostsView,
    SavedPostsListView,
    PostLikeToggleView,
    PostSaveToggleView,
    CommentListCreateView,
)

urlpatterns = [
    path("", PostListView.as_view(), name="post-list"),
    path("create/", PostCreateView.as_view(), name="post-create"),
    path("mine/", MyPostsView.as_view(), name="post-mine"),
    path("saved/", SavedPostsListView.as_view(), name="post-saved"),
    path("<uuid:post_id>/like/", PostLikeToggleView.as_view(), name="post-like"),
    path("<uuid:post_id>/save/", PostSaveToggleView.as_view(), name="post-save"),
    path("<uuid:post_id>/comments/", CommentListCreateView.as_view(), name="post-comments"),
]