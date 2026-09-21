import uuid

from django.db import transaction
from rest_framework import generics, permissions, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.authentication import SupabaseAuthentication
from feedback_main.image_validation import validate_uploaded_image
from feedback_main.supabase_storage import delete_image, upload_image

from .models import Post, PostMedia
from .serializers import PostSerializer


class PostPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50


class PostListView(generics.ListAPIView):
    """Public feed — every published post, newest first."""

    serializer_class = PostSerializer
    pagination_class = PostPagination
    authentication_classes = [TokenAuthentication, SupabaseAuthentication]
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
    authentication_classes = [TokenAuthentication, SupabaseAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Post.objects.filter(author=self.request.user)
            .select_related("author__profile")
            .prefetch_related("media")
        )


class PostCreateView(APIView):
    authentication_classes = [
        TokenAuthentication,
        SupabaseAuthentication,
    ]
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        images = request.FILES.getlist("images")

        if not images:
            return Response(
                {"images": "Please select at least one image."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # validate every image up front, before touching the DB or storage
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

                for position, (image, extension) in enumerate(
                    zip(images, extensions)
                ):
                    image_path = (
                        f"users/{request.user.id}/"
                        f"posts/{post.id}/"
                        f"{uuid.uuid4().hex}{extension}"
                    )

                    upload_image(
                        bucket="post-images",
                        path=image_path,
                        image=image,
                    )
                    uploaded_paths.append(image_path)

                    PostMedia.objects.create(
                        post=post,
                        storage_bucket="post-images",
                        storage_path=image_path,
                        mime_type=image.content_type,
                        position=position,
                    )

        except Exception:
            # roll back any images that did make it to storage
            for path in uploaded_paths:
                try:
                    delete_image(bucket="post-images", path=path)
                except Exception:
                    pass
            raise

        serializer = PostSerializer(post, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)