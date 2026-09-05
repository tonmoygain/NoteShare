from rest_framework import serializers
from django.contrib.auth.models import User

from .models import (
    Note,
    Blog,
    DiscussionRoom,
    DiscussionMessage,
    UserProfile,
)


class NoteSerializer(serializers.ModelSerializer):

    uploader_name = serializers.CharField(
        source="uploader.username",
        read_only=True
    )

    class Meta:

        model = Note

        fields = "__all__"

        read_only_fields = (
            "views",
            "downloads",
            "uploaded_at",
            "uploader",
        )

        extra_kwargs = {
            "department": {
                "required": False,
                "allow_blank": True,
            },
            "class_level": {
                "required": False,
                "allow_blank": True,
            },
            "subject": {
                "required": False,
                "allow_blank": True,
            },
            "chapter": {
                "required": False,
                "allow_blank": True,
            },
            "board": {
                "required": False,
                "allow_blank": True,
            },
            "semester": {
                "required": False,
                "allow_blank": True,
            },
            "course": {
                "required": False,
                "allow_blank": True,
            },
        }

    def validate(self, attrs):

        education_level = attrs.get(
            "education_level",
            getattr(
                self.instance,
                "education_level",
                "university"

            )
        )

        department = attrs.get(
            "department",
            getattr(
                self.instance,
                "department",
                ""
            )
        ) or ""

        class_level = attrs.get(
            "class_level",
            getattr(
                self.instance,
                "class_level",
                ""
            )
        ) or ""

        subject = attrs.get(
            "subject",
            getattr(
                self.instance,
                "subject",
                ""
            )
        ) or ""

        if (
            education_level == "university"
            and not department.strip()
        ):
            raise serializers.ValidationError({
                "department":
                    "Department is required for university resources."
            })

        if education_level == "school":

            if not class_level.strip():
                raise serializers.ValidationError({
                    "class_level":
                        "Class is required for school resources."
                })

            if not subject.strip():
                raise serializers.ValidationError({
                    "subject":
                        "Subject is required for school resources."
                })

        return attrs

class BlogSerializer(serializers.ModelSerializer):

    author_name = serializers.CharField(
        source="author.username",
        read_only=True
    )

    class Meta:

        model = Blog

        fields = "__all__"

        read_only_fields = (
            "author",
            "created_at",
            "updated_at",
            "views",
        )


class DiscussionRoomSerializer(serializers.ModelSerializer):

    created_by_name = serializers.CharField(
        source="created_by.username",
        read_only=True
    )

    member_count = serializers.IntegerField(
        source="members.count",
        read_only=True
    )

    class Meta:

        model = DiscussionRoom

        fields = [
            "id",
            "name",
            "description",
            "category",
            "department",
            "parent_room",
            "members",
            "member_count",
            "created_by",
            "created_by_name",
            "created_at",
        ]

        read_only_fields = (
            "created_by",
            "created_at",
            "member_count",
        )


class DiscussionMessageSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    class Meta:

        model = DiscussionMessage

        fields = [
            "id",
            "room",
            "user",
            "username",
            "message",
            "created_at",
            "updated_at",
        ]

        read_only_fields = (
            "user",
            "created_at",
            "updated_at",
        )


class UserProfileSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    email = serializers.EmailField(
        source="user.email",
        read_only=True
    )

    class Meta:

        model = UserProfile

        fields = [
            "id",
            "username",
            "email",
            "photo",
            "bio",
            "department",
            "location",
            "website",
            "linkedin",
            "github",
            "facebook",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "username",
            "email",
            "updated_at",
        ]