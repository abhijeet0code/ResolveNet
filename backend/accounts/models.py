import logging

from django.db import models
from django.contrib.auth.models import User
from pgvector.django import VectorField
from django.db.models.signals import post_save
from django.dispatch import receiver


class Profile(models.Model):
    OCCUPATION_CHOICES=[
    ("student", "Student"),
    ("working_professional", "Working Professional"),
    ("researcher", "Researcher / Academic"),
    ("business_owner", "Business Owner / Entrepreneur"),
    ("teacher", "Teacher / Educator"),
    ("social_worker", "Social Worker / NGO Member"),
    ("government_official", "Government Department Official"),
    ("other", "Other"),

    ]


    user = models.OneToOneField(User,on_delete=models.CASCADE,related_name="profile")

    full_name = models.CharField(max_length=100,blank=True,default="")
    username = models.CharField(max_length=100,unique=True,null=True,blank=True)
    phone= models.CharField(max_length=15,unique=True,null=True,blank=True)

    city = models.CharField(max_length=50,blank=True,default="")
    state = models.CharField(max_length=50,blank=True,default="")

    bio = models.TextField(blank=True,default="")
    occupation = models.CharField(
        max_length=50,
        choices=OCCUPATION_CHOICES,
        default="other"
    )

    avatar_path = models.CharField(
    max_length=500,
    blank=True,
    default="",
    ) 

    

    embedding = VectorField(dimensions=384, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username or self.user.username

@receiver(post_save, sender=Profile)
def update_profile_embedding(sender, instance, created, update_fields, **kwargs):
    # avatar upload ya embedding-only save pe dobara embedding mat banao
    if update_fields is not None and not (
        {"username", "full_name"} & set(update_fields)
    ):
        return

    text = f"{instance.username or ''} {instance.full_name or ''}".strip()
    if not text:
        return

    try:
        from .utils import get_embedding

        Profile.objects.filter(pk=instance.pk).update(
            embedding=get_embedding(text)
        )
    except Exception:
        logging.getLogger(__name__).exception("Embedding generation failed")