import uuid

from django.conf import settings
from django.db import models


class Post(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"
        RESOLVED = "resolved", "Resolved"
        REMOVED = "removed", "Removed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="posts",
    )

    caption = models.TextField()

    location_name = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)

    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PUBLISHED,
        db_index=True,
    )

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.author.username}: {self.caption[:40]}"


class PostMedia(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="media")

    storage_bucket = models.CharField(max_length=100, default="post-images")
    storage_path = models.CharField(max_length=500)

    mime_type = models.CharField(max_length=100)
    position = models.PositiveSmallIntegerField(default=0)
    alt_text = models.CharField(max_length=300, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["position"]


class Like(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="post_likes",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # one like per user per post
        unique_together = ("post", "user")


class SavedPost(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="saves")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="saved_posts",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("post", "user")
        ordering = ["-created_at"]


class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="post_comments",
    )
    text = models.TextField(max_length=1000)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

        # ---- posts/models.py ke END mein ye paste karo (existing code ko mat chhedo) ----

class Suggestion(models.Model):
    # Solution Room ki tabs (Citizen / University / ...)
    class Category(models.TextChoices):
        CITIZEN = "citizen", "Citizen"
        UNIVERSITY = "university", "University"
        INDUSTRIAL = "industrial", "Industrial"
        EXPERT = "expert", "Experts"
        GOVERNMENT = "government", "Government"
        NGO = "ngo", "NGO"
        OTHER = "other", "Other"

    # suggestion dene wala kis roop me madad kar raha hai
    class RoleTag(models.TextChoices):
        SAVIOUR = "saviour", "Saviour"
        HELPER = "helper", "Helper"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="suggestions")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="post_suggestions",
    )
    # null = top-level suggestion, set = reply (sirf 1 level deep, Instagram jaisa)
    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="replies",
    )
    # purana text field rehta hai: purani suggestions aur replies isi me hain.
    # Nayi suggestion me text = description (taaki purana modal bhi chale)
    text = models.TextField(max_length=1000)

    # --- Solution Room ke naye fields (sab optional, purana data nahi tootega) ---
    title = models.CharField(max_length=200, blank=True)
    description = models.TextField(max_length=2000, blank=True)
    needs = models.JSONField(default=list, blank=True)  # ["More dustbins", "Regular cleaning"]
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.CITIZEN,
        db_index=True,
    )
    role_tag = models.CharField(max_length=20, choices=RoleTag.choices, blank=True)

    # --- "Admin Only" panel (sirf official/government badal sakte hain) ---
    approx_budget = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    approx_start = models.DateField(null=True, blank=True)
    approx_end = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        indexes = [models.Index(fields=["post", "parent"])]


class SuggestionUpvote(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    suggestion = models.ForeignKey(
        Suggestion, on_delete=models.CASCADE, related_name="upvotes"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="suggestion_upvotes",
    )
    # 1 = upvote, -1 = downvote (purani rows apne aap 1 = upvote rahengi)
    value = models.SmallIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # ek user ek suggestion par ek hi vote (up ya down) de sakta hai
        unique_together = ("suggestion", "user")


class SuggestionReport(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    suggestion = models.ForeignKey(
        Suggestion, on_delete=models.CASCADE, related_name="reports"
    )
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="suggestion_reports",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # ek user ek suggestion ko ek hi baar report kar sakta hai
        unique_together = ("suggestion", "reporter")
        ordering = ["-created_at"]