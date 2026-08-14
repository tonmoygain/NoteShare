from django.contrib import admin

from .models import (
    Note,
    Blog,
    DiscussionRoom,
    DiscussionMessage,
)


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "department",
        "uploader",
        "views",
        "downloads",
        "featured",
        "uploaded_at",
    )

    search_fields = (
        "title",
        "description",
        "department",
        "uploader__username",
    )

    list_filter = (
        "department",
        "featured",
        "uploaded_at",
    )


@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "author",
        "views",
        "featured",
        "created_at",
    )

    search_fields = (
        "title",
        "content",
        "author__username",
    )

    list_filter = (
        "featured",
        "created_at",
    )


@admin.register(DiscussionRoom)
class DiscussionRoomAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "department",
        "created_by",
        "created_at",
    )

    search_fields = (
        "name",
        "department",
    )

    list_filter = (
        "department",
        "created_at",
    )


@admin.register(DiscussionMessage)
class DiscussionMessageAdmin(admin.ModelAdmin):
    list_display = (
        "room",
        "user",
        "created_at",
    )

    search_fields = (
        "message",
        "user__username",
        "room__name",
    )

    list_filter = (
        "room",
        "created_at",
    )