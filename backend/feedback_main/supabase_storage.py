# core/supabase_storage.py

from urllib.parse import quote

from django.conf import settings
from supabase import Client, create_client


supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_ROLE_KEY,
)


def upload_image(*, bucket, path, image):
    image.seek(0)

    supabase.storage.from_(bucket).upload(
        path=path,
        file=image.read(),
        file_options={
            "content-type": image.content_type,
            "cache-control": "3600",
            "upsert": "false",
        },
    )

    return path


def get_public_image_url(*, bucket, path):
    if not path:
        return None

    safe_path = quote(path, safe="/")

    return (
        f"{settings.SUPABASE_URL}"
        f"/storage/v1/object/public/{bucket}/{safe_path}"
    )


def delete_image(*, bucket, path):
    if path:
        supabase.storage.from_(bucket).remove([path])