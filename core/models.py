from django.db import models
from django.contrib.auth.models import User

from cloudinary_storage.storage import (
    MediaCloudinaryStorage,
    RawMediaCloudinaryStorage,
)


# ==========================================
# CUSTOM CLOUDINARY STORAGE FOR NOTES
# ==========================================

class NoteCloudinaryStorage(MediaCloudinaryStorage):

    def _get_resource_type(self, name):
        name = name.lower()

        if name.endswith(".pdf"):
            return "raw"

        return "image"


# =========================================================
# USER PROFILE
# =========================================================

class UserProfile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    photo = models.ImageField(
        upload_to="profiles/",
        storage=MediaCloudinaryStorage(),
        blank=True,
        null=True
    )

    bio = models.TextField(
        blank=True,
        max_length=500
    )

    department = models.CharField(
        max_length=100,
        blank=True
    )

    location = models.CharField(
        max_length=150,
        blank=True
    )

    website = models.URLField(
        blank=True
    )

    linkedin = models.URLField(
        blank=True
    )

    github = models.URLField(
        blank=True
    )

    facebook = models.URLField(
        blank=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.user.username} Profile"


# =========================================================
# NOTE
# =========================================================

class Note(models.Model):

    uploader = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notes",
        null=True,
        blank=True
    )

    title = models.CharField(
        max_length=200
    )

    education_level = models.CharField(
        max_length=30,
        default="university"
    )

    department = models.CharField(
        max_length=100,
        blank=True
    )

    class_level = models.CharField(
        max_length=50,
        blank=True
    )

    subject = models.CharField(
        max_length=100,
        blank=True
    )

    chapter = models.CharField(
        max_length=150,
        blank=True
    )

    board = models.CharField(
        max_length=100,
        blank=True
    )

    semester = models.CharField(
        max_length=50,
        blank=True
    )

    course = models.CharField(
        max_length=150,
        blank=True
    )

    description = models.TextField(
        blank=True
    )

    file = models.FileField(
        upload_to="notes/",
        storage=NoteCloudinaryStorage()
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    views = models.PositiveIntegerField(
        default=0
    )

    downloads = models.PositiveIntegerField(
        default=0
    )

    featured = models.BooleanField(
        default=False
    )

    def __str__(self):
        return self.title


# =========================================================
# BLOG
# =========================================================

class Blog(models.Model):

    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="blogs"
    )

    title = models.CharField(
        max_length=250
    )

    content = models.TextField()

    image = models.ImageField(
        upload_to="blogs/",
        storage=MediaCloudinaryStorage(),
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    views = models.PositiveIntegerField(
        default=0
    )

    featured = models.BooleanField(
        default=False
    )

    def __str__(self):
        return self.title


# =========================================================
# DISCUSSION ROOM
# =========================================================

class DiscussionRoom(models.Model):

    name = models.CharField(
        max_length=150
    )

    description = models.TextField(
        blank=True
    )

    category = models.CharField(
        max_length=100
    )

    department = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    members = models.ManyToManyField(
        User,
        related_name="discussion_rooms",
        blank=True
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_rooms"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    parent_room = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="child_rooms"
    )

    def __str__(self):
        return self.name


# =========================================================
# DISCUSSION MESSAGE
# =========================================================

class DiscussionMessage(models.Model):

    room = models.ForeignKey(
        DiscussionRoom,
        on_delete=models.CASCADE,
        related_name="messages"
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="discussion_messages"
    )

    message = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.user.username} - {self.room.name}"


    
# Add this model class to the existing core/models.py:
class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ("note_created", "Note Created"),
        ("new_note", "New Note"),
        ("note_updated", "Note Updated"),
        ("note_deleted", "Note Deleted"),
        ("note_download", "Note Downloaded"),
        ("blog_created", "Blog Created"),
        ("new_blog", "New Blog"),
        ("blog_updated", "Blog Updated"),
        ("blog_deleted", "Blog Deleted"),
        ("room_created", "Room Created"),
        ("new_room", "New Room"),
        ("room_joined", "Room Joined"),
        ("room_left", "Room Left"),
        ("room_message", "Room Message"),
        ("system", "System"),
    ]

    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    actor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="triggered_notifications",
    )

    notification_type = models.CharField(
        max_length=40,
        choices=NOTIFICATION_TYPES,
    )

    title = models.CharField(max_length=180)
    message = models.TextField()
    link = models.CharField(max_length=300, blank=True, default="")

    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(
                fields=["recipient", "is_read", "-created_at"]
            ),
            models.Index(
                fields=["recipient", "-created_at"]
            ),
        ]

    def mark_as_read(self):
        if not self.is_read:
            from django.utils import timezone

            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=["is_read", "read_at"])

    def __str__(self):
        return f"{self.recipient.username} - {self.title}"
