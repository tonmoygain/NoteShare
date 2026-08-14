from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    photo = models.ImageField(
        upload_to="profiles/",
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


class Note(models.Model):

    uploader = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notes",
        null=True,
        blank=True
    )

    title = models.CharField(max_length=200)

    department = models.CharField(max_length=100)

    description = models.TextField(blank=True)

    file = models.FileField(upload_to="notes/")

    uploaded_at = models.DateTimeField(auto_now_add=True)

    views = models.PositiveIntegerField(default=0)

    downloads = models.PositiveIntegerField(default=0)

    featured = models.BooleanField(default=False)

    def __str__(self):

        return self.title
    
class Blog(models.Model):

    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="blogs"
    )

    title = models.CharField(max_length=250)

    content = models.TextField()

    image = models.ImageField(
        upload_to="blogs/",
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    views = models.PositiveIntegerField(default=0)

    featured = models.BooleanField(default=False)

    def __str__(self):

        return self.title

class DiscussionRoom(models.Model):

    name = models.CharField(max_length=150)

    description = models.TextField(blank=True)

    category = models.CharField(max_length=100)

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

    def __str__(self):
        return self.name

    parent_room = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="child_rooms"
    )


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
