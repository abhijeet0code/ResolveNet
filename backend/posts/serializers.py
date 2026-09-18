from rest_framework import serializers

from feedback_main.supabase_storage import get_public_image_url
from .models import Post, PostMedia


class PostMediaSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PostMedia
        fields = [
            "id",
            "image_url",
            "mime_type",
            "position",
            "alt_text",
        ]

    def get_image_url(self, media):
        return get_public_image_url(
            bucket=media.storage_bucket,
            path=media.storage_path,
        )


class PostSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    media = PostMediaSerializer(many=True, read_only=True)

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
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "author",
            "status",
            "created_at",
            "updated_at",
        ]

    def get_author(self, post):
        profile = post.author.profile

        return {
            "id": post.author.id,
            "username": post.author.username,
            "full_name": profile.full_name,
            "avatar_url": get_public_image_url(
                bucket="avatars",
                path=profile.avatar_path,
            ),
        }