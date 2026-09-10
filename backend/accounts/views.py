



from rest_framework import generics, permissions
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .serializers import RegisterSerializer
from .models import Profile


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        identifier = request.data.get('identifier')
        password = request.data.get('password')

        user_obj = User.objects.filter(username=identifier).first()
        if not user_obj:
            user_obj = User.objects.filter(email=identifier).first()
        if not user_obj:
            profile = Profile.objects.filter(phone_number=identifier).first()
            user_obj = profile.user if profile else None

        if user_obj:
            user = authenticate(username=user_obj.username, password=password)
            if user:
                token, created = Token.objects.get_or_create(user=user)
                return Response({'token': token.key, 'username': user.username})

        return Response({'error': 'Invalid credentials'}, status=400)


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({
            'user': {
                'username': request.user.username,
                'email': request.user.email,
            }
        })