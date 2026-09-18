

from pathlib import Path

from PIL import Image
from rest_framework.exceptions import ValidationError


ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB


def validate_uploaded_image(image):
    if not image:
        raise ValidationError("Please select an image.")

    if image.size > MAX_IMAGE_SIZE:
        raise ValidationError(
            "The image must be smaller than 5 MB."
        )

    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise ValidationError(
            "Only JPG, PNG and WebP images are allowed."
        )

    try:
        Image.open(image).verify()
    except Exception as exc:
        raise ValidationError(
            "The uploaded file is not a valid image."
        ) from exc
    finally:
        image.seek(0)

    return ALLOWED_IMAGE_TYPES[image.content_type]