from django.db import models
from django.contrib.auth.models import User



class Profile(models.Model):
    user = models.OneToOneField(User,on_delete=models.CASCADE,related_name="profile")

    full_name = models.CharField(max_length=100,blank=True,default="")
    username = models.CharField(max_length=100,unique=True,null=True,blank=True)
    phone= models.CharField(max_length=15,unique=True,null=True,blank=True)

    city = models.CharField(max_length=50,blank=True,default="")
    state = models.CharField(max_length=50,blank=True,default="")

    bio = models.TextField(blank=True,default="")

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username or self.user.username