import uuid
from datetime import timedelta

from django.db import transaction
from django.db.models import Count, F, OuterRef, Q, Subquery
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError
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
    SuggestionReport,
    SuggestionUpvote,
)
from .serializers import (
    CommentSerializer,
    PostSerializer,
    SuggestionManageSerializer,
    SuggestionSerializer,
    is_official,
)


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
    """Counts + 'meri vote kya hai?' ek hi query mein (N+1 se bachne ke liye)."""
    return queryset.select_related("author__profile").annotate(
        upvotes_total=Count("upvotes", filter=Q(upvotes__value=1), distinct=True),
        downvotes_total=Count("upvotes", filter=Q(upvotes__value=-1), distinct=True),
        replies_total=Count("replies", distinct=True),
        my_vote_value=Subquery(
            SuggestionUpvote.objects.filter(
                suggestion=OuterRef("pk"), user=user
            ).values("value")[:1]
        ),
    )


class SuggestionListCreateView(generics.ListCreateAPIView):
    """
    GET: post ke top-level suggestions (sabse zyada upvote pehle).
         ?category=citizen se ek tab ki suggestions.
    POST: nayi suggestion — title, description, needs, category, role_tag.
    """

    serializer_class = SuggestionSerializer
    pagination_class = PostPagination
    authentication_classes = AUTH_CLASSES
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Suggestion.objects.filter(
            post_id=self.kwargs["post_id"], parent__isnull=True
        )

        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)

        qs = annotate_suggestions(qs, self.request.user)
        # sabse zyada (up - down) wali suggestion upar
        return qs.annotate(score=F("upvotes_total") - F("downvotes_total")).order_by(
            "-score", "created_at"
        )

    def perform_create(self, serializer):
        post = get_object_or_404(Post, id=self.kwargs["post_id"])

        # naya form "description" bhejta hai, purana modal sirf "text"
        description = (
            self.request.data.get("description") or self.request.data.get("text") or ""
        ).strip()
        if not description:
            raise ValidationError({"description": "Description can't be empty."})

        serializer.save(
            post=post,
            author=self.request.user,
            description=description,
            text=description[:1000],
        )


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


def apply_vote(suggestion, user, value):
    """
    value: 1 (upvote) ya -1 (downvote).
    Wahi button dobara dabaya to vote hat jata hai, doosra dabaya to vote badal jata hai.
    Return: meri nayi vote (1, -1 ya 0).
    """
    vote = SuggestionUpvote.objects.filter(suggestion=suggestion, user=user).first()

    if vote and vote.value == value:
        vote.delete()
        return 0

    if vote:
        vote.value = value
        vote.save(update_fields=["value"])
        return value

    SuggestionUpvote.objects.create(suggestion=suggestion, user=user, value=value)
    return value


def vote_counts(suggestion):
    votes = suggestion.upvotes
    return votes.filter(value=1).count(), votes.filter(value=-1).count()


class SuggestionVoteView(APIView):
    """POST /api/posts/suggestions/<id>/vote/   body: {"value": 1} ya {"value": -1}"""

    authentication_classes = AUTH_CLASSES
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, suggestion_id):
        suggestion = get_object_or_404(Suggestion, id=suggestion_id)

        try:
            value = int(request.data.get("value"))
        except (TypeError, ValueError):
            value = None
        if value not in (1, -1):
            raise ValidationError({"value": "value 1 (up) ya -1 (down) honi chahiye."})

        my_vote = apply_vote(suggestion, request.user, value)
        upvotes, downvotes = vote_counts(suggestion)

        return Response(
            {"my_vote": my_vote, "upvotes_count": upvotes, "downvotes_count": downvotes},
            status=status.HTTP_200_OK,
        )


class SuggestionUpvoteToggleView(APIView):
    """Purana endpoint — ab bhi chalta hai (sirf upvote toggle)."""

    authentication_classes = AUTH_CLASSES
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, suggestion_id):
        suggestion = get_object_or_404(Suggestion, id=suggestion_id)

        my_vote = apply_vote(suggestion, request.user, 1)
        upvotes, downvotes = vote_counts(suggestion)

        return Response(
            {
                "upvoted": my_vote == 1,
                "upvotes_count": upvotes,
                "downvotes_count": downvotes,
            },
            status=status.HTTP_200_OK,
        )


class SuggestionDetailView(generics.DestroyAPIView):
    """DELETE /api/posts/suggestions/<id>/ — sirf apni suggestion/reply delete ho sakti hai."""

    authentication_classes = AUTH_CLASSES
    permission_classes = [permissions.IsAuthenticated]
    queryset = Suggestion.objects.all()
    lookup_field = "id"
    lookup_url_kwarg = "suggestion_id"

    def perform_destroy(self, instance):
        if instance.author_id != self.request.user.id:
            raise PermissionDenied("You can only delete your own suggestion.")
        instance.delete()


class SuggestionReportView(APIView):
    """POST /api/posts/suggestions/<id>/report/ — admin me SuggestionReport me dikhega."""

    authentication_classes = AUTH_CLASSES
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, suggestion_id):
        suggestion = get_object_or_404(Suggestion, id=suggestion_id)

        if suggestion.author_id == request.user.id:
            raise ValidationError({"error": "You can't report your own suggestion."})

        SuggestionReport.objects.get_or_create(
            suggestion=suggestion, reporter=request.user
        )
        return Response({"reported": True}, status=status.HTTP_200_OK)


class SuggestionManageView(APIView):
    """PATCH /api/posts/suggestions/<id>/manage/ — sirf official: approx budget / time badalna."""

    authentication_classes = AUTH_CLASSES
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, suggestion_id):
        if not is_official(request.user):
            raise PermissionDenied("Only officials can manage this section.")

        suggestion = get_object_or_404(Suggestion, id=suggestion_id)
        serializer = SuggestionManageSerializer(suggestion, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Trending + single post
# ---------------------------------------------------------------------------

TRENDING_DAYS = 7
TRENDING_LIMIT = 12


class PostTrendingView(generics.ListAPIView):
    """Pichhle 7 din mein sabse zyada likes + suggestions wale posts (Search page ke liye)."""

    serializer_class = PostSerializer
    pagination_class = None
    authentication_classes = AUTH_CLASSES
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        since = timezone.now() - timedelta(days=TRENDING_DAYS)
        return (
            Post.objects.filter(status=Post.Status.PUBLISHED)
            .select_related("author__profile")
            .prefetch_related("media")
            .annotate(
                recent_likes=Count(
                    "likes", filter=Q(likes__created_at__gte=since), distinct=True
                ),
                recent_suggestions=Count(
                    "suggestions", filter=Q(suggestions__created_at__gte=since), distinct=True
                ),
            )
            .annotate(score=F("recent_likes") + F("recent_suggestions"))
            .order_by("-score", "-created_at")[:TRENDING_LIMIT]
        )


class PostDetailView(generics.RetrieveAPIView):
    """Ek single post — search result ya share link kholne ke liye."""

    serializer_class = PostSerializer
    authentication_classes = AUTH_CLASSES
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"
    lookup_url_kwarg = "post_id"

    def get_queryset(self):
        return (
            Post.objects.exclude(status=Post.Status.REMOVED)
            .select_related("author__profile")
            .prefetch_related("media")
        )