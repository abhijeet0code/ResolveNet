from django.contrib.auth.models import User
from rest_framework import serializers

from feedback_main.supabase_storage import get_public_image_url
from .models import Profile


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "email",
            "password",
            "confirm_password",
        ]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value

    def validate(self, data):
        if data.get("password") != data.get("confirm_password"):
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match."}
            )
        return data

    def create(self, validated_data):
        validated_data.pop("confirm_password")

        user = User.objects.create_user(
            username=validated_data["email"],
            email=validated_data["email"],
            password=validated_data["password"],
        )

        return user


class ProfileSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = Profile

        fields = [
            "id",
            "full_name",
            "username",
            "phone",
            "city",
            "state",
            "bio",
            "avatar_url",
            "occupation",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "avatar_url",
            "created_at",
            "updated_at",
        ]

        # full_name / username / phone / city / state are required in the wizard,
        # bio stays optional
        extra_kwargs = {
            "full_name": {"required": True, "allow_blank": False},
            "username": {"required": True, "allow_blank": False, "allow_null": False},
            "phone": {"required": True, "allow_blank": False, "allow_null": False},
            "city": {"required": True, "allow_blank": False},
            "state": {"required": True, "allow_blank": False},
            "occupation":{"required":True ,  "allow_blank":False},
        }

    def get_avatar_url(self, profile):
        if not profile.avatar_path:
            return None
        return get_public_image_url(bucket="avatars", path=profile.avatar_path)