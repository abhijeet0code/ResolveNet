import uuid

from django.db import transaction
from rest_framework import permissions, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from core.image_validation import validate_uploaded_image
from core.supabase_storage import delete_image, upload_image
from .models import Post, PostMedia
from .serializers import PostSerializer


class PostCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        image = request.FILES.get("image")
        extension = validate_uploaded_image(image)

        caption = request.data.get("caption", "").strip()

        if not caption:
            return Response(
                {"caption": "Caption is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        post = None
        image_path = None

        try:
            with transaction.atomic():
                post = Post.objects.create(
                    author=request.user,
                    caption=caption,
                    location_name=request.data.get(
                        "location_name",
                        "",
                    ),
                    city=request.data.get("city", ""),
                    state=request.data.get("state", ""),
                    latitude=request.data.get("latitude") or None,
                    longitude=request.data.get("longitude") or None,
                )

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

                PostMedia.objects.create(
                    post=post,
                    storage_bucket="post-images",
                    storage_path=image_path,
                    mime_type=image.content_type,
                    position=0,
                    alt_text=request.data.get("alt_text", ""),
                )

        except Exception:
            # Prevent an unused Supabase image if database work fails.
            if image_path:
                try:
                    delete_image(
                        bucket="post-images",
                        path=image_path,
                    )
                except Exception:
                    pass

            raise

        serializer = PostSerializer(
            post,
            context={"request": request},
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )