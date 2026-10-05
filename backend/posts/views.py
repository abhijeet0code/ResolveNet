import uuid

from django.db import transaction
from django.db.models import Count, Exists, OuterRef
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError
from rest_framework import generics, permissions, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.authentication import SupabaseAuthentication
from feedback_main.image_validation import validate_uploaded_image
from feedback_main.supabase_storage import delete_image, upload_image

from .models import (
    Post,
    PostMedia,
    Like,
    SavedPost,
    Comment,
    Suggestion,
    SuggestionUpvote,
)
from .serializers import PostSerializer, CommentSerializer, SuggestionSerializer


AUTH_CLASSES = [TokenAuthentication, SupabaseAuthentication]


class PostPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50


class PostListView(generics.ListAPIView):
    """Public feed — every published post, newest first."""

    serializer_class = PostSerializer
    pagination_class = PostPagination
    authentication_classes = AUTH_CLASSES
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Post.objects.filter(status=Post.Status.PUBLISHED)
            .select_related("author__profile")
            .prefetch_related("media")
        )


class MyPostsView(generics.ListAPIView):
    """Only the logged-in user's own posts — Profile page's Reports tab."""

    serializer_class = PostSerializer
    pagination_class = PostPagination
    authentication_classes = AUTH_CLASSES
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Post.objects.filter(author=self.request.user)
            .select_related("author__profile")
            .prefetch_related("media")
        )


class SavedPostsListView(generics.ListAPIView):
    """Posts the logged-in user has bookmarked — Profile page's Saved tab."""

    serializer_class = PostSerializer
    pagination_class = PostPagination
    authentication_classes = AUTH_CLASSES
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Post.objects.filter(saves__user=self.request.user)
            .select_related("author__profile")
            .prefetch_related("media")
        )


class PostCreateView(APIView):
    authentication_classes = AUTH_CLASSES
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        images = request.FILES.getlist("images")

        if not images:
            return Response(
                {"images": "Please select at least one image."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        extensions = [validate_uploaded_image(image) for image in images]

        caption = request.data.get("caption", "").strip()
        if not caption:
            return Response(
                {"caption": "Caption is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        post = None
        uploaded_paths = []

        try:
            with transaction.atomic():
                post = Post.objects.create(
                    author=request.user,
                    caption=caption,
                    location_name=request.data.get("location_name", ""),
                    city=request.data.get("city", ""),
                    state=request.data.get("state", ""),
                    latitude=request.data.get("latitude") or None,
                    longitude=request.data.get("longitude") or None,
                )

                for position, (image, extension) in enumerate(zip(images, extensions)):
                    image_path = (
                        f"users/{request.user.id}/"
                        f"posts/{post.id}/"
                        f"{uuid.uuid4().hex}{extension}"
                    )

                    upload_image(bucket="post-images", path=image_path, image=image)
                    uploaded_paths.append(image_path)

                    PostMedia.objects.create(
                        post=post,
                        storage_bucket="post-images",
                        storage_path=image_path,
                        mime_type=image.content_type,
                        position=position,
                    )

        except Exception:
            for path in uploaded_paths:
                try:
                    delete_image(bucket="post-images", path=path)
                except Exception:
                    pass
            raise

        serializer = PostSerializer(post, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PostLikeToggleView(APIView):
    authentication_classes = AUTH_CLASSES
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        like = Like.objects.filter(post=post, user=request.user).first()

        if like:
            like.delete()
            liked = False
        else:
            Like.objects.create(post=post, user=request.user)
            liked = True

        return Response(
            {"liked": liked, "likes_count": post.likes.count()},
            status=status.HTTP_200_OK,
        )


class PostSaveToggleView(APIView):
    authentication_classes = AUTH_CLASSES
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        saved = SavedPost.objects.filter(post=post, user=request.user).first()

        if saved:
            saved.delete()
            is_saved = False
        else:
            SavedPost.objects.create(post=post, user=request.user)
            is_saved = True

        return Response({"saved": is_saved}, status=status.HTTP_200_OK)


class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    authentication_classes = AUTH_CLASSES
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Comment.objects.filter(
            post_id=self.kwargs["post_id"]
        ).select_related("author__profile")

    def perform_create(self, serializer):
        post = get_object_or_404(Post, id=self.kwargs["post_id"])
        text = self.request.data.get("text", "").strip()
        if not text:
            raise ValidationError({"text": "Comment can't be empty."})
        serializer.save(post=post, author=self.request.user, text=text)


# ---------------------------------------------------------------------------
# Suggestions
# ---------------------------------------------------------------------------

def annotate_suggestions(queryset, user):
    """Counts + 'maine upvote kiya?' ek hi query mein (N+1 se bachne ke liye)."""
    return queryset.select_related("author__profile").annotate(
        upvotes_total=Count("upvotes", distinct=True),
        replies_total=Count("replies", distinct=True),
        upvoted_by_me=Exists(
            SuggestionUpvote.objects.filter(suggestion=OuterRef("pk"), user=user)
        ),
    )


class SuggestionListCreateView(generics.ListCreateAPIView):
    """GET: post ke top-level suggestions (sabse zyada upvote pehle). POST: nayi suggestion."""

    serializer_class = SuggestionSerializer
    pagination_class = PostPagination
    authentication_classes = AUTH_CLASSES
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Suggestion.objects.filter(
            post_id=self.kwargs["post_id"], parent__isnull=True
        )
        return annotate_suggestions(qs, self.request.user).order_by(
            "-upvotes_total", "created_at"
        )

    def perform_create(self, serializer):
        post = get_object_or_404(Post, id=self.kwargs["post_id"])
        text = self.request.data.get("text", "").strip()
        if not text:
            raise ValidationError({"text": "Suggestion can't be empty."})
        serializer.save(post=post, author=self.request.user, text=text)


class SuggestionReplyListCreateView(generics.ListCreateAPIView):
    """GET: ek suggestion ke replies (purane pehle). POST: reply."""

    serializer_class = SuggestionSerializer
    authentication_classes = AUTH_CLASSES
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Suggestion.objects.filter(parent_id=self.kwargs["suggestion_id"])
        return annotate_suggestions(qs, self.request.user).order_by("created_at")

    def perform_create(self, serializer):
        target = get_object_or_404(Suggestion, id=self.kwargs["suggestion_id"])
        # reply ka reply bhi original suggestion ke neeche hi jaayega (1 level deep)
        root = target.parent or target
        text = self.request.data.get("text", "").strip()
        if not text:
            raise ValidationError({"text": "Reply can't be empty."})
        serializer.save(post=root.post, parent=root, author=self.request.user, text=text)


class SuggestionUpvoteToggleView(APIView):
    authentication_classes = AUTH_CLASSES
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, suggestion_id):
        suggestion = get_object_or_404(Suggestion, id=suggestion_id)
        upvote = SuggestionUpvote.objects.filter(
            suggestion=suggestion, user=request.user
        ).first()

        if upvote:
            upvote.delete()
            upvoted = False
        else:
            SuggestionUpvote.objects.create(suggestion=suggestion, user=request.user)
            upvoted = True

        return Response(
            {"upvoted": upvoted, "upvotes_count": suggestion.upvotes.count()},
            status=status.HTTP_200_OK,
        )