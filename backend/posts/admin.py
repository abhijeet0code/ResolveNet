from django.contrib import admin

from .models import Suggestion, SuggestionReport


@admin.register(Suggestion)
class SuggestionAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "category", "parent", "created_at")
    list_filter = ("category",)
    search_fields = ("title", "description", "text", "author__username")


@admin.register(SuggestionReport)
class SuggestionReportAdmin(admin.ModelAdmin):
    # kis suggestion ko kisne report kiya
    list_display = ("suggestion", "reporter", "created_at")
    search_fields = ("reporter__username",)