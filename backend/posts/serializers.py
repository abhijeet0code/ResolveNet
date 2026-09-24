from rest_framework import serializers

from feedback_main.supabase_storage import get_public_image_url
from .models import Post, PostMedia, Comment


class PostMediaSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PostMedia
        fields = ["id", "image_url", "mime_type", "position", "alt_text"]

    def get_image_url(self, media):
        return get_public_image_url(bucket=media.storage_bucket, path=media.storage_path)


def _author_payload(user):
    profile = getattr(user, "profile", None)

    if not profile:
        return {
            "id": user.id,
            "username": user.username,
            "full_name": "",
            "avatar_url": None,
        }

    return {
        "id": user.id,
        "username": profile.username or user.username,
        "full_name": profile.full_name,
        "avatar_url": get_public_image_url(bucket="avatars", path=profile.avatar_path),
    }


class CommentSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ["id", "author", "text", "created_at"]
        read_only_fields = ["id", "author", "created_at"]

    def get_author(self, comment):
        return _author_payload(comment.author)


class PostSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    media = PostMediaSerializer(many=True, read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
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

    def _request_user(self):
        request = self.context.get("request")
        return request.user if request else None

    def get_is_liked(self, post):
        user = self._request_user()
        return bool(user and post.likes.filter(user=user).exists())

    def get_is_saved(self, post):
        user = self._request_user()
        return bool(user and post.saves.filter(user=user).exists())