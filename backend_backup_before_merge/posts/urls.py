from django.urls import path

from .views import (
    PostListView,
    PostCreateView,
    MyPostsView,
    SavedPostsListView,
    PostLikeToggleView,
    PostSaveToggleView,
    CommentListCreateView,
    SuggestionListCreateView,
    SuggestionReplyListCreateView,
    SuggestionUpvoteToggleView,
)

urlpatterns = [
    path("", PostListView.as_view(), name="post-list"),
    path("create/", PostCreateView.as_view(), name="post-create"),
    path("mine/", MyPostsView.as_view(), name="post-mine"),
    path("saved/", SavedPostsListView.as_view(), name="post-saved"),
    path("<uuid:post_id>/like/", PostLikeToggleView.as_view(), name="post-like"),
    path("<uuid:post_id>/save/", PostSaveToggleView.as_view(), name="post-save"),
    path("<uuid:post_id>/comments/", CommentListCreateView.as_view(), name="post-comments"),
    path("<uuid:post_id>/suggestions/", SuggestionListCreateView.as_view(), name="post-suggestions"),
    path("suggestions/<uuid:suggestion_id>/replies/", SuggestionReplyListCreateView.as_view(), name="suggestion-replies"),
    path("suggestions/<uuid:suggestion_id>/upvote/", SuggestionUpvoteToggleView.as_view(), name="suggestion-upvote"),
]