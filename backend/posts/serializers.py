from rest_framework import serializers

from feedback_main.supabase_storage import get_public_image_url
from .models import Post, PostMedia, Comment, Suggestion


class PostMediaSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PostMedia
        fields = ["id", "image_url", "mime_type", "position", "alt_text"]

    def get_image_url(self, media):
        return get_public_image_url(bucket=media.storage_bucket, path=media.storage_path)


def is_official(user):
    """Profile.role == "official" ho to True. Profile na ho to bhi crash nahi karta."""
    profile = getattr(user, "profile", None)
    return bool(profile and profile.role == "official")


def _author_payload(user):
    profile = getattr(user, "profile", None)

    if not profile:
        return {
            "id": user.id,
            "username": user.username,
            "full_name": "",
            "avatar_url": None,
            "city": "",
            "state": "",
        }

    return {
        "id": user.id,
        "username": profile.username or user.username,
        "full_name": profile.full_name,
        "avatar_url": get_public_image_url(bucket="avatars", path=profile.avatar_path),
        "city": profile.city,
        "state": profile.state,
    }


class CommentSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ["id", "author", "text", "created_at"]
        read_only_fields = ["id", "author", "created_at"]

    def get_author(self, comment):
        return _author_payload(comment.author)


class SuggestionSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    upvotes_count = serializers.SerializerMethodField()
    downvotes_count = serializers.SerializerMethodField()
    my_vote = serializers.SerializerMethodField()  # 1 = maine upvote kiya, -1 = downvote, 0 = kuch nahi
    is_upvoted = serializers.SerializerMethodField()
    is_mine = serializers.SerializerMethodField()  # kya ye suggestion meri hai (menu me Delete/Report ke liye)
    replies_count = serializers.SerializerMethodField()

    # "Needs" — chhoti chhoti lines ki list (max 10)
    needs = serializers.ListField(
        child=serializers.CharField(max_length=200),
        required=False,
        max_length=10,
    )

    class Meta:
        model = Suggestion
        fields = [
            "id",
            "author",
            "text",
            "title",
            "description",
            "needs",
            "category",
            "role_tag",
            "parent",
            "upvotes_count",
            "downvotes_count",
            "my_vote",
            "is_upvoted",
            "is_mine",
            "replies_count",
            "approx_budget",
            "approx_start",
            "approx_end",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "author",
            "parent",
            "approx_budget",
            "approx_start",
            "approx_end",
            "created_at",
        ]
        # purana modal aur replies sirf "text" bhejte hain, naya form title + description
        extra_kwargs = {"text": {"required": False}}

    def get_author(self, suggestion):
        return _author_payload(suggestion.author)

    # budget / time sirf official ko dikhte hain, baaki users ke response se hat jaate hain
    def to_representation(self, instance):
        data = super().to_representation(instance)

        if not hasattr(self, "_viewer_is_official"):  # ek request me ek hi baar check
            request = self.context.get("request")
            self._viewer_is_official = bool(request and is_official(request.user))

        if not self._viewer_is_official:
            for key in ("approx_budget", "approx_start", "approx_end"):
                data.pop(key, None)
        return data

    # View annotate karta hai (fast). Annotate nahi hua (jaise create response) to fallback query.
    def get_upvotes_count(self, suggestion):
        annotated = getattr(suggestion, "upvotes_total", None)
        if annotated is not None:
            return annotated
        return suggestion.upvotes.filter(value=1).count()

    def get_downvotes_count(self, suggestion):
        annotated = getattr(suggestion, "downvotes_total", None)
        if annotated is not None:
            return annotated
        return suggestion.upvotes.filter(value=-1).count()

    def get_my_vote(self, suggestion):
        if hasattr(suggestion, "my_vote_value"):
            return suggestion.my_vote_value or 0  # annotate me vote na ho to None aata hai
        request = self.context.get("request")
        user = request.user if request else None
        if not user:
            return 0
        vote = suggestion.upvotes.filter(user=user).first()
        return vote.value if vote else 0

    def get_is_upvoted(self, suggestion):
        return self.get_my_vote(suggestion) == 1

    def get_is_mine(self, suggestion):
        request = self.context.get("request")
        user = request.user if request else None
        return bool(user and suggestion.author_id == user.id)

    def get_replies_count(self, suggestion):
        annotated = getattr(suggestion, "replies_total", None)
        return annotated if annotated is not None else suggestion.replies.count()


class SuggestionManageSerializer(serializers.ModelSerializer):
    """Official ke liye: budget aur time badalna."""

    class Meta:
        model = Suggestion
        fields = ["approx_budget", "approx_start", "approx_end"]
        extra_kwargs = {"approx_budget": {"min_value": 0}}

    def validate(self, data):
        start = data.get("approx_start", self.instance.approx_start if self.instance else None)
        end = data.get("approx_end", self.instance.approx_end if self.instance else None)
        if start and end and end < start:
            raise serializers.ValidationError(
                {"approx_end": "End date can't be before start date."}
            )
        return data


class PostSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    media = PostMediaSerializer(many=True, read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    suggestions_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "author",
            "caption",
            "location_name",
            "city",
            "state",
            "latitude",
            "longitude",
            "status",
            "media",
            "likes_count",
            "comments_count",
            "suggestions_count",
            "is_liked",
            "is_saved",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "author",
            "status",
            "likes_count",
            "comments_count",
            "suggestions_count",
            "is_liked",
            "is_saved",
            "created_at",
            "updated_at",
        ]

    def get_author(self, post):
        return _author_payload(post.author)

    def get_likes_count(self, post):
        return post.likes.count()

    def get_comments_count(self, post):
        return post.comments.count()

    def get_suggestions_count(self, post):
        # sirf top-level suggestions gine jaate hain, replies nahi
        return post.suggestions.filter(parent__isnull=True).count()

    def _request_user(self):
        request = self.context.get("request")
        return request.user if request else None

    def get_is_liked(self, post):
        user = self._request_user()
        return bool(user and post.likes.filter(user=user).exists())

    def get_is_saved(self, post):
        user = self._request_user()
        return bool(user and post.saves.filter(user=user).exists())