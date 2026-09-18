from rest_framework import generics, permissions,status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
import uuid
from .serializers import RegisterSerializer,ProfileSerializer
from rest_framework.permissions import IsAuthenticated
from .authentication import SupabaseAuthentication
from rest_framework.authentication import TokenAuthentication

from .models import Profile
from rest_framework.authentication import TokenAuthentication
from rest_framework.parsers import FormParser, MultiPartParser
from feedback_main.image_validation import validate_uploaded_image
from feedback_main.supabase_storage import (
    delete_image,
    get_public_image_url,
    upload_image,
)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        identifier = request.data.get('identifier')
        password = request.data.get('password')

        # Pehle username se dhoondh
        user_obj = User.objects.filter(username=identifier).first()

        # Nahi mila to email se dhoondh
        if not user_obj:
            user_obj = User.objects.filter(email=identifier).first()

        # Phir bhi nahi mila to phone_number se dhoondh
        if not user_obj:
            profile = Profile.objects.filter(phone_number=identifier).first()
            user_obj = profile.user if profile else None

        if user_obj:
            user = authenticate(username=user_obj.username, password=password)
            if user:
                token, created = Token.objects.get_or_create(user=user)
                return Response({'token': token.key, 'username': user.username})

        return Response({'error': 'Invalid credentials'}, status=400)

class CurrentUserView(APIView):

    authentication_classes = [TokenAuthentication,SupabaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):

        return Response({
            "id":request.user.id,
            "email": request.user.email,
            "username": request.user.username,
        })


class ProfileView(APIView):

    authentication_classes = [
        TokenAuthentication,
        SupabaseAuthentication
    ]

    permission_classes=[IsAuthenticated]


    def get(self,request):

        try:
            profile=Profile.objects.get(user=request.user)

        except Profile.DoesNotExist:

             return Response(
                  {
                       "message": "Profile not found."
                  },status=status.HTTP_404_NOT_FOUND
             )

        serializer=ProfileSerializer(profile)

        return Response(
             serializer.data,
             status=status.HTTP_200_OK
        )

    def post(self,request):
    
            if Profile.objects.filter(user=request.user).exists():
                 return Response({"message":"Profile already exists."},
                      status=status.HTTP_400_BAD_REQUEST
                 )
            serializer=ProfileSerializer(data=request.data)
            
            if serializer.is_valid():
                serializer.save(
                    user=request.user
                )
                return Response(
                    {
                        "message": "Profile created successfully.",
                        "profile": serializer.data
                    },
                    status=status.HTTP_201_CREATED
                )
    
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

class ProfileAvatarUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        image = request.FILES.get("image")
        extension = validate_uploaded_image(image)

        profile = request.user.profile
        old_avatar_path = profile.avatar_path

        new_avatar_path = (
            f"users/{request.user.id}/"
            f"{uuid.uuid4().hex}{extension}"
        )

        upload_image(
            bucket="avatars",
            path=new_avatar_path,
            image=image,
        )

        profile.avatar_path = new_avatar_path
        profile.save(update_fields=["avatar_path", "updated_at"])

        if old_avatar_path:
            try:
                delete_image(
                    bucket="avatars",
                    path=old_avatar_path,
                )
            except Exception:
                pass

        return Response(
            {
                "message": "Profile image updated.",
                "avatar_path": profile.avatar_path,
                "avatar_url": get_public_image_url(
                    bucket="avatars",
                    path=profile.avatar_path,
                ),
            },
            status=status.HTTP_200_OK,
        )