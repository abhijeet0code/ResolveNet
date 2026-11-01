from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Post

from feedback_main.supabase_storage import get_public_image_url
from accounts.models import Profile

class PostSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'title', 'description', 'category',
                  'latitude', 'longitude', 'author', 'created_at']


class ProfileSearchSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['id', 'user_id', 'username', 'full_name', 'city', 'state', 'avatar_url']

    def get_avatar_url(self, profile):
        if not profile.avatar_path:
            return None
        return get_public_image_url(bucket="avatars", path=profile.avatar_path)