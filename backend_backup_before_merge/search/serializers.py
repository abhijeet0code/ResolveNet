from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Post


class PostSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'title', 'description', 'category',
                  'latitude', 'longitude', 'author', 'created_at']


class AccountSerializer(serializers.ModelSerializer):
    # email / phone jaan bujh ke nahi diya, search mein private data nahi dikhna chahiye
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']
