from django.contrib import admin

from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    # yahin se kisi ko "official" banao (role badlo)
    list_display = ("username", "full_name", "city", "state", "role")
    list_filter = ("role",)
    search_fields = ("username", "full_name", "user__email")
    exclude = ("embedding",)