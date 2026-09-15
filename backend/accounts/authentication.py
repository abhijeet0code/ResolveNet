import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

User = get_user_model()

class SupabaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return None
        try:
            token_type, token = auth_header.split(" ")
        except ValueError:
            raise AuthenticationFailed(
                "Invalid authorization header"
            )
        if token_type.lower() != "bearer":
            raise AuthenticationFailed(
                "Invalid token type"
            )

        response = requests.get(
            f"{settings.SUPABASE_URL}/auth/v1/user",

            headers={
                "Authorization": f"Bearer {token}",
                "apikey": settings.SUPABASE_PUBLISHABLE_KEY,
            },

            timeout=10,
        )

        if response.status_code != 200:
            raise AuthenticationFailed(
                "Invalid or expired token"
            )

        supabase_user = response.json()

        email = supabase_user.get("email")
        supabase_id = supabase_user.get("id")

        if not email:
            raise AuthenticationFailed(
                "User email not found"
            )

        user = User.objects.filter(
            email__iexact=email
        ).first()

        if not user:
            user = User.objects.create_user(
                username=supabase_id,
                email=email,
            )

        return (user, supabase_user)