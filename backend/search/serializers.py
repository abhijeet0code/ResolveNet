from rest_framework import serializers

from posts.models import Post

class PostSearchSerializers(serializers.ModelSerializer):


    image=serializers.SerializerMethodField

    class Meta:
        model=Post

        fields=["id","category","location","image"]

    def get_image(self,obj):
        
    