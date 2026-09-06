import requests
import re
import os
import mimetypes

from django.http import HttpResponseRedirect
from difflib import SequenceMatcher

from google import genai

from google.genai import types

from django.shortcuts import render, get_object_or_404
from django.core.paginator import Paginator

import fitz

from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.http import FileResponse

import secrets
from django.contrib.auth.decorators import login_required
from django.core import signing
from django.http import JsonResponse, HttpResponseRedirect
from django.core.cache import cache

from rest_framework_simplejwt.tokens import RefreshToken

from django.db.models import Sum
from django.utils import timezone

from .models import (
    Note,
    Blog,
    DiscussionRoom,
    DiscussionMessage,
    UserProfile,
    Notification,
)

from .serializers import (
    NoteSerializer,
    BlogSerializer,
    DiscussionRoomSerializer,
    DiscussionMessageSerializer,
    UserProfileSerializer,
)


# ==========================
# Notifications
# ==========================

def create_notification(
    recipient,
    title,
    message,
    notification_type,
    link="",
    actor=None,
):
    """Create one persistent in-app notification for a user."""
    if not recipient:
        return None

    return Notification.objects.create(
        recipient=recipient,
        actor=actor,
        notification_type=notification_type,
        title=(title or "NoteShare notification").strip(),
        message=(message or "").strip(),
        link=(link or "").strip(),
    )


def home(request):

    return render(request, "home.html")


# ==========================
# Authentication
# ==========================

@api_view(["POST"])
def register_user(request):

    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")

    if not username or not email or not password:

        return Response(

            {
                "error": "All fields are required."
            },

            status=status.HTTP_400_BAD_REQUEST

        )

    if User.objects.filter(username=username).exists():

        return Response(

            {
                "error": "Username already exists."
            },

            status=status.HTTP_400_BAD_REQUEST

        )

    if User.objects.filter(email=email).exists():

        return Response(

            {
                "error": "Email already exists."
            },

            status=status.HTTP_400_BAD_REQUEST

        )

    user = User.objects.create(

        username=username,

        email=email,

        password=make_password(password)

    )

    return Response(

        {
            "message": "Registration Successful",

            "username": user.username,

            "email": user.email,

        },

        status=status.HTTP_201_CREATED

    )


# ==========================
# Notes
# ==========================

@api_view(["GET"])
def note_list(request):

    page = request.GET.get("page", 1)

    notes = Note.objects.all().order_by("-uploaded_at")

    featured_notes = Note.objects.filter(
        featured=True
    ).order_by("-uploaded_at")

    paginator = Paginator(notes, 6)

    current_page = paginator.get_page(page)

    serializer = NoteSerializer(
        current_page.object_list,
        many=True
    )

    return Response({

        "notes": serializer.data,

        "featured_notes": NoteSerializer(
            featured_notes,
            many=True
        ).data,

        "total_pages": paginator.num_pages,

        "current_page": current_page.number,

        "has_next": current_page.has_next(),

        "has_previous": current_page.has_previous(),

    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_note(request):

    serializer = NoteSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    note = serializer.save(uploader=request.user)

    # Notification must never break note creation
    try:
        create_notification(
            recipient=request.user,
            actor=request.user,
            notification_type="note_created",
            title="Note Published",
            message=f'Your note "{note.title}" was published successfully.',
            link=f"/note/{note.id}",
        )

        Notification.objects.bulk_create([
            Notification(
                recipient=user,
                actor=request.user,
                notification_type="new_note",
                title="New Note Available",
                message=f'{request.user.username} published a new note: "{note.title}".',
                link=f"/note/{note.id}",
            )
            for user in User.objects.exclude(id=request.user.id)
        ])

    except Exception as error:
        print("NOTE NOTIFICATION ERROR:", repr(error))

    return Response(
        NoteSerializer(note).data,
        status=status.HTTP_201_CREATED
    )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_note(request, pk):

    note = get_object_or_404(Note, pk=pk)

    if note.uploader != request.user:

        return Response(
            {
                "error": "You are not allowed to delete this note."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    create_notification(
        recipient=request.user,
        actor=request.user,
        notification_type="note_deleted",
        title="Note Deleted",
        message=f'Your note "{note.title}" was deleted.',
    )

    note.delete()

    return Response(
        {
            "message": "Note deleted successfully"
        }
    )


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_note(request, id):

    try:

        note = Note.objects.get(id=id)

    except Note.DoesNotExist:

        return Response(

            {
                "error": "Note not found"
            },

            status=status.HTTP_404_NOT_FOUND

        )
    
    print("NOTE OWNER:", note.uploader)
    print("REQUEST USER:", request.user)
    print("AUTH:", request.user.is_authenticated)
    
    if note.uploader != request.user:

        return Response(
            {
                "error": "You are not allowed to edit this note."
            },
            status=status.HTTP_403_FORBIDDEN

        )

    serializer = NoteSerializer(

        note,

        data=request.data,

        partial=True

    )

    if serializer.is_valid():

        serializer.save()

        create_notification(
            recipient=request.user,
            actor=request.user,
            notification_type="note_updated",
            title="Note Updated",
            message=f'Your note "{note.title}" was updated successfully.',
            link=f"/note/{note.id}",
        )

        return Response(serializer.data)
    
    print(serializer.errors)

    return Response(

        serializer.errors,

        status=status.HTTP_400_BAD_REQUEST

    )

@api_view(["GET"])
def note_detail(request, id):

    try:

        note = Note.objects.get(id=id)

    except Note.DoesNotExist:

        return Response(
            {
                "error": "Note not found"
            },
            status=status.HTTP_404_NOT_FOUND
        )

    # Increase View Count
    note.views += 1
    note.save(update_fields=["views"])

    serializer = NoteSerializer(note)

    return Response(serializer.data)


@api_view(["GET"])
def extract_note_text(request, id):

    try:
        note = Note.objects.get(id=id)

    except Note.DoesNotExist:
        return Response(
            {
                "error": "Note not found"
            },
            status=status.HTTP_404_NOT_FOUND
        )

    if not note.file:
        return Response(
            {
                "error": "This note does not have a file."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    file_name = note.file.name.lower()

    if not file_name.endswith(".pdf"):
        return Response(
            {
                "error": "AI processing currently supports PDF files only."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    try:

        with note.file.open("rb") as file:

            pdf_document = fitz.open(
                stream=file.read(),
                filetype="pdf"
            )

            extracted_text = ""

            for page in pdf_document:
                extracted_text += page.get_text()

            pdf_document.close()

    except Exception as e:

        return Response(
            {
                "error": "Could not extract text from this PDF.",
                "details": str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    extracted_text = extracted_text.strip()

    if not extracted_text:

        return Response(
            {
                "error": "No readable text was found in this PDF."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    return Response({

        "note_id": note.id,

        "title": note.title,

        "text_length": len(extracted_text),

        "text": extracted_text,

    })

@api_view(["GET"])
def download_note(request, id):

    try:
        note = Note.objects.get(id=id)

    except Note.DoesNotExist:
        return Response(
            {
                "error": "Note not found"
            },
            status=status.HTTP_404_NOT_FOUND
        )

    if not note.file:
        return Response(
            {
                "error": "This note does not have a file."
            },
            status=status.HTTP_404_NOT_FOUND
        )

    try:
        file_url = note.file.url

    except Exception as error:

        print("Cloudinary URL Error:", error)

        return Response(
            {
                "error": "Could not generate file URL.",
                "details": str(error)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    note.downloads += 1
    note.save(update_fields=["downloads"])

    if request.user.is_authenticated and request.user != note.uploader:
        Notification.objects.create(
            recipient=note.uploader,
            notification_type="note_download",
            title="Note Downloaded",
            message=f'Your note "{note.title}" was downloaded.',
            link=f"/note/{note.id}",
        )

    return HttpResponseRedirect(file_url)



@api_view(["GET"])
def dashboard_stats(request):

    total_notes = Note.objects.count()

    total_views = Note.objects.aggregate(
        total=Sum("views")
    )["total"] or 0

    total_downloads = Note.objects.aggregate(
        total=Sum("downloads")
    )["total"] or 0

    total_users = User.objects.filter(
        is_active=True,
        is_staff=False,
        is_superuser=False,
    ).count()

    featured_notes = Note.objects.filter(
        featured=True
    ).count()

    most_downloaded = Note.objects.order_by("-downloads")[:5]
    most_viewed = Note.objects.order_by("-views")[:5]

    return Response({

        "total_notes": total_notes,

        "total_views": total_views,

        "total_downloads": total_downloads,
        
        "total_users": total_users,

        "featured_notes": featured_notes,

        "most_downloaded": NoteSerializer(
            most_downloaded,
            many=True
        ).data,

        "most_viewed": NoteSerializer(
            most_viewed,
            many=True
        ).data,

    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_profile(request):

    user = request.user

    profile, created = UserProfile.objects.get_or_create(
        user=user
    )

    notes = Note.objects.filter(
        uploader=user
    ).order_by("-uploaded_at")

    blogs = Blog.objects.filter(
        author=user
    ).order_by("-created_at")

    total_notes = notes.count()

    total_views = notes.aggregate(
        total=Sum("views")
    )["total"] or 0

    total_downloads = notes.aggregate(
        total=Sum("downloads")
    )["total"] or 0

    data = UserProfileSerializer(
        profile,
        context={"request": request}
    ).data

    data.update({

        "total_notes": total_notes,

        "total_views": total_views,

        "total_downloads": total_downloads,

        "user_notes": NoteSerializer(
            notes,
            many=True
        ).data,

        "user_blogs": BlogSerializer(
            blogs,
            many=True
        ).data,

        "discussion_rooms_count":
            user.discussion_rooms.count(),

        "discussion_messages_count":
            user.discussion_messages.count(),

        "date_joined":
            user.date_joined,

        "has_usable_password":
            user.has_usable_password(),

    })

    return Response(data)


@api_view(["GET"])
def blog_list(request):

    blogs = Blog.objects.all().order_by("-created_at")

    serializer = BlogSerializer(
        blogs,
        many=True
    )

    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_blog(request):

    serializer = BlogSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    blog = serializer.save(author=request.user)

    # Notification must never break blog publishing
    try:
        create_notification(
            recipient=request.user,
            actor=request.user,
            notification_type="blog_created",
            title="Blog Published",
            message=f'Your blog "{blog.title}" was published successfully.',
            link=f"/blog/{blog.id}",
        )

        Notification.objects.bulk_create([
            Notification(
                recipient=user,
                actor=request.user,
                notification_type="new_blog",
                title="New Blog Published",
                message=f'{request.user.username} published a new blog: "{blog.title}".',
                link=f"/blog/{blog.id}",
            )
            for user in User.objects.exclude(id=request.user.id)
        ])

    except Exception as error:
        print("BLOG NOTIFICATION ERROR:", repr(error))

    return Response(
        BlogSerializer(blog).data,
        status=status.HTTP_201_CREATED
    )

@api_view(["GET"])
def blog_detail(request, id):

    try:

        blog = Blog.objects.get(id=id)

    except Blog.DoesNotExist:

        return Response(
            {
                "error": "Blog not found"
            },
            status=status.HTTP_404_NOT_FOUND
        )

    blog.views += 1
    blog.save(update_fields=["views"])

    serializer = BlogSerializer(blog)

    return Response(serializer.data)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_blog(request, id):

    try:

        blog = Blog.objects.get(id=id)

    except Blog.DoesNotExist:

        return Response(
            {
                "error": "Blog not found"
            },
            status=status.HTTP_404_NOT_FOUND
        )
    
    if blog.author != request.user:

        return Response(
            
            {
                "error": "You are not allowed to delete this blog."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    create_notification(
        recipient=request.user,
        actor=request.user,
        notification_type="blog_deleted",
        title="Blog Deleted",
        message=f'Your blog "{blog.title}" was deleted.',
    )

    blog.delete()

    return Response({

        "message": "Blog deleted successfully"

    })

@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def update_blog(request, id):

    try:

        blog = Blog.objects.get(id=id)

    except Blog.DoesNotExist:

        return Response(
            {
                "error": "Blog not found"
            },
            status=status.HTTP_404_NOT_FOUND
        )
    
    if blog.author != request.user:

        return Response(
            {
                "error": "You are not allowed to edit this blog."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = BlogSerializer(

        blog,

        data=request.data,

        partial=True

    )

    if serializer.is_valid():

        serializer.save()

        create_notification(
            recipient=request.user,
            actor=request.user,
            notification_type="blog_updated",
            title="Blog Updated",
            message=f'Your blog "{blog.title}" was updated successfully.',
            link=f"/blog/{blog.id}",
        )

        return Response(serializer.data)

    return Response(

        serializer.errors,

        status=status.HTTP_400_BAD_REQUEST

    )

# ==========================
# Discussion Rooms
# ==========================

@api_view(["GET"])
@permission_classes([AllowAny])
def discussion_rooms(request):

    # Only top-level rooms
    rooms = DiscussionRoom.objects.filter(
        parent_room__isnull=True
    ).order_by("name")

    serializer = DiscussionRoomSerializer(
        rooms,
        many=True
    )

    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_discussion_room(request):

    serializer = DiscussionRoomSerializer(
        data=request.data
    )

    if serializer.is_valid():

        room = serializer.save(
            created_by=request.user
        )

        room.members.add(request.user)

        create_notification(
            recipient=request.user,
            actor=request.user,
            notification_type="room_created",
            title="Discussion Room Created",
            message=f'Your discussion room "{room.name}" was created successfully.',
            link=f"/rooms/{room.id}",
        )

        Notification.objects.bulk_create([
            Notification(
                recipient=user,
                actor=request.user,
                notification_type="new_room",
                title="New Discussion Room",
                message=f'{request.user.username} created a new discussion room: "{room.name}".',
                link=f"/rooms/{room.id}",
            )
            for user in User.objects.exclude(id=request.user.id)
        ])

        return Response(
            DiscussionRoomSerializer(room).data,
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def discussion_room_detail(request, id):

    room = get_object_or_404(
        DiscussionRoom,
        id=id
    )

    serializer = DiscussionRoomSerializer(room)

    child_rooms = DiscussionRoom.objects.filter(
        parent_room=room
    ).order_by("name")

    child_serializer = DiscussionRoomSerializer(
        child_rooms,
        many=True
    )

    data = serializer.data

    data["child_rooms"] = child_serializer.data

    return Response(data)


@api_view(["GET"])
@permission_classes([AllowAny])
def discussion_child_rooms(request, id):

    parent_room = get_object_or_404(
        DiscussionRoom,
        id=id
    )

    child_rooms = DiscussionRoom.objects.filter(
        parent_room=parent_room
    ).order_by("name")

    serializer = DiscussionRoomSerializer(
        child_rooms,
        many=True
    )

    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def join_discussion_room(request, id):

    room = get_object_or_404(
        DiscussionRoom,
        id=id
    )

    already_member = room.members.filter(id=request.user.id).exists()

    room.members.add(request.user)

    if not already_member and room.created_by != request.user:
        create_notification(
            recipient=room.created_by,
            actor=request.user,
            notification_type="room_joined",
            title="New Room Member",
            message=f'{request.user.username} joined your discussion room "{room.name}".',
            link=f"/rooms/{room.id}",
        )

    return Response({
        "message": "Joined room successfully",
        "member_count": room.members.count()
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def leave_discussion_room(request, id):

    room = get_object_or_404(
        DiscussionRoom,
        id=id
    )

    was_member = room.members.filter(id=request.user.id).exists()

    room.members.remove(request.user)

    if was_member and room.created_by != request.user:
        create_notification(
            recipient=room.created_by,
            actor=request.user,
            notification_type="room_left",
            title="Room Member Left",
            message=f'{request.user.username} left your discussion room "{room.name}".',
            link=f"/rooms/{room.id}",
        )

    return Response({
        "message": "Left room successfully",
        "member_count": room.members.count()
    })


@api_view(["GET"])
@permission_classes([AllowAny])
def discussion_messages(request, room_id):

    room = get_object_or_404(
        DiscussionRoom,
        id=room_id
    )

    messages = DiscussionMessage.objects.filter(
        room=room
    ).select_related(
        "user"
    ).order_by("created_at")

    serializer = DiscussionMessageSerializer(
        messages,
        many=True
    )

    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_discussion_message(request, room_id):

    room = get_object_or_404(
        DiscussionRoom,
        id=room_id
    )

    message_text = request.data.get(
        "message",
        ""
    ).strip()

    if not message_text:

        return Response(
            {
                "error": "Message cannot be empty."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    message = DiscussionMessage.objects.create(
        room=room,
        user=request.user,
        message=message_text
    )

    serializer = DiscussionMessageSerializer(
        message
    )

    Notification.objects.bulk_create([
        Notification(
            recipient=user,
            actor=request.user,
            notification_type="room_message",
            title=f"New Message in {room.name}",
            message=f'{request.user.username} sent a new message in "{room.name}".',
            link=f"/rooms/{room.id}",
        )
        for user in room.members.exclude(id=request.user.id)
    ])

    return Response(
        serializer.data,
        status=status.HTTP_201_CREATED
    )

# =====================================================
# SOCIAL LOGIN → SIMPLE JWT
# =====================================================

@login_required
def social_login_complete(request):

    user = request.user

    nonce = secrets.token_urlsafe(32)

    payload = {
        "user_id": user.id,
        "nonce": nonce,
    }

    code = signing.dumps(
        payload,
        salt="notes-share-social-login"
    )

    # Code can be used only once.
    cache.set(
        f"social_login_code:{nonce}",
        True,
        timeout=60
    )

    frontend_url = (
        "https://noteshare-frontend.onrender.com/social-callback"
        f"?code={code}"
    )

    return HttpResponseRedirect(frontend_url)


def social_login_token(request):

    code = request.GET.get("code")

    if not code:
        return JsonResponse(
            {
                "detail": "Missing social login code."
            },
            status=400
        )

    try:

        payload = signing.loads(
            code,
            salt="notes-share-social-login",
            max_age=60
        )

    except signing.BadSignature:

        return JsonResponse(
            {
                "detail":
                    "Invalid or expired social login code."
            },
            status=400
        )

    user_id = payload.get("user_id")
    nonce = payload.get("nonce")

    if not user_id or not nonce:

        return JsonResponse(
            {
                "detail":
                    "Invalid social login payload."
            },
            status=400
        )

    cache_key = (
        f"social_login_code:{nonce}"
    )

    # One-time use
    if not cache.get(cache_key):

        return JsonResponse(
            {
                "detail":
                    "This social login code has already been used."
            },
            status=400
        )

    cache.delete(cache_key)

    from django.contrib.auth import get_user_model

    User = get_user_model()

    try:

        user = User.objects.get(
            id=user_id
        )

    except User.DoesNotExist:

        return JsonResponse(
            {
                "detail":
                    "User not found."
            },
            status=404
        )

    refresh = RefreshToken.for_user(user)

    return JsonResponse(
        {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "username": user.username,
            "email": user.email or "",
        }
    )


@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def update_user_profile(request):

    user = request.user

    profile, created = UserProfile.objects.get_or_create(
        user=user
    )

    username = request.data.get("username")
    email = request.data.get("email")

    # ==========================================
    # REMOVE PROFILE PHOTO
    # ==========================================

    remove_photo = request.data.get("remove_photo")

    if str(remove_photo).lower() == "true":

        if profile.photo:
            profile.photo.delete(save=False)

        profile.photo = None

    # ==========================================
    # USERNAME
    # ==========================================

    if username is not None:

        username = username.strip()

        if not username:

            return Response(
                {
                    "error":
                        "Username cannot be empty."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(
            username=username
        ).exclude(
            id=user.id
        ).exists():

            return Response(
                {
                    "error":
                        "Username already exists."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        user.username = username

    # ==========================================
    # EMAIL
    # ==========================================

    if email is not None:

        email = email.strip()

        if not email:

            return Response(
                {
                    "error":
                        "Email cannot be empty."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(
            email=email
        ).exclude(
            id=user.id
        ).exists():

            return Response(
                {
                    "error":
                        "Email already exists."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        user.email = email

    # Save username/email
    user.save()

    # ==========================================
    # PROFILE DATA
    # ==========================================

    serializer = UserProfileSerializer(
        profile,
        data=request.data,
        partial=True,
        context={
            "request": request
        }
    )

    if not serializer.is_valid():

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer.save()

    # ==========================================
    # FINAL RESPONSE
    # ==========================================

    return Response({

        "message":
            "Profile updated successfully.",

        **serializer.data,

        "username":
            user.username,

        "email":
            user.email,

    })


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_account(request):

    user = request.user

    user.delete()

    return Response(
        {
            "message":
                "Account deleted successfully."
        },
        status=status.HTTP_200_OK
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):

    user = request.user

    current_password = (
        request.data.get("current_password")
    )

    new_password = (
        request.data.get("new_password")
    )

    confirm_password = (
        request.data.get("confirm_password")
    )

    if not current_password:
        return Response(
            {
                "error":
                    "Current password is required."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    if not new_password:
        return Response(
            {
                "error":
                    "New password is required."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    if new_password != confirm_password:
        return Response(
            {
                "error":
                    "New passwords do not match."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(new_password) < 6:
        return Response(
            {
                "error":
                    "Password must be at least 6 characters."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    if not user.check_password(
        current_password
    ):

        return Response(
            {
                "error":
                    "Current password is incorrect."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    user.set_password(
        new_password
    )

    user.save()

    return Response({
        "message":
            "Password changed successfully."
    })


def get_note_text(note):
    """
    Extract text from a Note when possible.

    PDF  -> PyMuPDF
    PNG/JPG/JPEG -> Tesseract OCR if available

    Returns empty string if extraction is unavailable.
    AI chat can still send the original image/PDF directly
    to Gemini when this returns an empty string.
    """

    if not note.file:
        return ""

    file_name = note.file.name.lower()

    try:

        # ==========================================
        # PDF TEXT EXTRACTION
        # ==========================================

        if file_name.endswith(".pdf"):

            with note.file.open("rb") as file:

                pdf_document = fitz.open(
                    stream=file.read(),
                    filetype="pdf"
                )

                extracted_text = ""

                for page in pdf_document:
                    extracted_text += page.get_text()

                pdf_document.close()

            return extracted_text.strip()


        # ==========================================
        # IMAGE OCR
        # ==========================================

        if file_name.endswith(
            (".png", ".jpg", ".jpeg")
        ):

            from io import BytesIO
            from PIL import Image
            import pytesseract
            import shutil

            tesseract_path = shutil.which(
                "tesseract"
            )

            if not tesseract_path:
                return ""

            pytesseract.pytesseract.tesseract_cmd = (
                tesseract_path
            )

            response = requests.get(
                note.file.url,
                timeout=30
            )

            response.raise_for_status()

            image = Image.open(
                BytesIO(response.content)
            )

            extracted_text = (
                pytesseract.image_to_string(
                    image
                )
            )

            return extracted_text.strip()


        # ==========================================
        # UNSUPPORTED FILE TYPE
        # ==========================================

        return ""


    except Exception as error:

        print(
            "Note Text Extraction Error:",
            repr(error)
        )

        return ""


# =========================================================
# AI ACADEMIC CONTEXT
# =========================================================

def get_note_academic_context(note):
    """
    Build a structured academic profile for AI Tutor / Assistant.

    Supports:
    - School
    - College
    - University

    Uses the metadata already stored on Note.
    """

    level = (
        note.education_level or "university"
    ).strip().lower()

    if level in {"school", "schooling"}:
        education_label = "School"

    elif level in {"college", "higher_secondary", "hsc"}:
        education_label = "College"

    else:
        education_label = "University"

    return {
        "education_level": education_label,
        "department": (
            note.department or ""
        ).strip(),
        "class_level": (
            note.class_level or ""
        ).strip(),
        "subject": (
            note.subject or ""
        ).strip(),
        "chapter": (
            note.chapter or ""
        ).strip(),
        "board": (
            note.board or ""
        ).strip(),
        "semester": (
            note.semester or ""
        ).strip(),
        "course": (
            note.course or ""
        ).strip(),
        "description": (
            note.description or ""
        ).strip(),
    }


def build_academic_context_block(note):
    """
    Convert Note academic metadata into a clean AI context block.
    """

    context = get_note_academic_context(note)

    return f"""
--- NOTE ACADEMIC PROFILE ---

Education Level: {context["education_level"]}

Department: {context["department"] or "Not specified"}

Class / Year: {context["class_level"] or "Not specified"}

Subject: {context["subject"] or "Not specified"}

Chapter / Topic: {context["chapter"] or "Not specified"}

Board / Curriculum: {context["board"] or "Not specified"}

Semester: {context["semester"] or "Not specified"}

Course: {context["course"] or "Not specified"}

Description: {context["description"] or "Not specified"}
"""

# =========================================================
# QUERY ACADEMIC LEVEL DETECTION
# =========================================================

def infer_query_academic_context(query):
    """
    Infer academic level signals directly from the student's question.

    This is intentionally lightweight.
    It does not replace Note metadata.
    It only gives the AI additional context when the question
    itself contains academic-level signals.
    """

    text = (
        query or ""
    ).strip().lower()

    signals = []

    # -----------------------------------------------------
    # SCHOOL SIGNALS
    # -----------------------------------------------------

    school_patterns = [
        r"\bclass\s*[1-9]\b",
        r"\bclass\s*1[0-2]\b",
        r"\bgrade\s*[1-9]\b",
        r"\bgrade\s*1[0-2]\b",
        r"\bssc\b",
        r"\bjunior\s*school\b",
        r"\bsecondary\s*school\b",
        r"\bprimary\s*school\b",
        r"\bnctb\b",
        r"\bschool\s*level\b",
    ]

    if any(
        re.search(pattern, text)
        for pattern in school_patterns
    ):
        signals.append("School")

    # -----------------------------------------------------
    # COLLEGE SIGNALS
    # -----------------------------------------------------

    college_patterns = [
        r"\bhsc\b",
        r"\bcollege\s*level\b",
        r"\bcollege\s*student\b",
        r"\bclass\s*xi\b",
        r"\bclass\s*xii\b",
        r"\byear\s*11\b",
        r"\byear\s*12\b",
        r"\bhigher\s*secondary\b",
        r"\bintermediate\b",
    ]

    if any(
        re.search(pattern, text)
        for pattern in college_patterns
    ):
        signals.append("College")

    # -----------------------------------------------------
    # UNIVERSITY SIGNALS
    # -----------------------------------------------------

    university_patterns = [
        r"\buniversity\b",
        r"\bundergraduate\b",
        r"\bgraduate\b",
        r"\bbachelor\b",
        r"\bbsc\b",
        r"\bbba\b",
        r"\bbeng\b",
        r"\bcse\b",
        r"\bit\b",
        r"\bengineering\b",
        r"\bsemester\b",
        r"\bcredit\b",
        r"\bthesis\b",
        r"\bresearch\b",
        r"\balgorithm\b",
        r"\bdata\s*structure\b",
        r"\boperating\s*system\b",
        r"\bdatabase\b",
    ]

    if any(
        re.search(pattern, text)
        for pattern in university_patterns
    ):
        signals.append("University")

    # -----------------------------------------------------
    # REMOVE DUPLICATES
    # -----------------------------------------------------

    signals = list(
        dict.fromkeys(signals)
    )

    if len(signals) == 1:

        return (
            f"Question-level academic signal: "
            f"{signals[0]}"
        )

    if len(signals) > 1:

        return (
            "Question-level academic signals: "
            + ", ".join(signals)
            + ". Do not assume a level when the signals conflict; "
              "use the clearest explicit context."
        )

    return (
        "No explicit academic level was detected "
        "from the student's question."
    )


def build_ai_academic_context(note=None, query=""):
    """
    Build the academic context that should be visible to the frontend.

    Priority:
    1. Selected Note metadata
    2. Explicit level detected in the query
    3. General Academic
    """

    # -----------------------------------------------------
    # NOTE-BASED CONTEXT
    # -----------------------------------------------------

    if note:

        context = get_note_academic_context(
            note
        )

        return {
            "level": context["education_level"],
            "class_level": context["class_level"],
            "subject": context["subject"],
            "department": context["department"],
            "semester": context["semester"],
            "course": context["course"],
            "board": context["board"],
            "chapter": context["chapter"],
            "source": "NoteShare Note",
        }


    # =====================================================
    # QUERY-BASED CONTEXT
    # =====================================================

    query = (
        query or ""
    ).strip().lower()

    # -----------------------------------------------------
    # SCHOOL
    # -----------------------------------------------------

    school_patterns = [
        r"\bclass\s*[1-9]\b",
        r"\bclass\s*1[0-2]\b",
        r"\bgrade\s*[1-9]\b",
        r"\bgrade\s*1[0-2]\b",
        r"\bssc\b",
        r"\bnctb\b",
        r"\bschool\b",
        r"\bsecondary\b",
        r"\bprimary\b",
    ]

    if any(
        re.search(
            pattern,
            query
        )
        for pattern in school_patterns
    ):

        class_match = re.search(
            r"\bclass\s*(1[0-2]|[1-9])\b",
            query
        )

        grade_match = re.search(
            r"\bgrade\s*(1[0-2]|[1-9])\b",
            query
        )

        detected_class = ""

        if class_match:
            detected_class = (
                f"Class {class_match.group(1)}"
            )

        elif grade_match:
            detected_class = (
                f"Grade {grade_match.group(1)}"
            )

        return {
            "level": "School",
            "class_level": detected_class,
            "subject": "",
            "department": "",
            "semester": "",
            "course": "",
            "board": "",
            "chapter": "",
            "source": "Question Context",
        }

    # -----------------------------------------------------
    # COLLEGE
    # -----------------------------------------------------

    college_patterns = [
        r"\bhsc\b",
        r"\bcollege\b",
        r"\bhigher\s*secondary\b",
        r"\bclass\s*xi\b",
        r"\bclass\s*xii\b",
        r"\bintermediate\b",
    ]

    if any(
        re.search(
            pattern,
            query
        )
        for pattern in college_patterns
    ):

        return {
            "level": "College",
            "class_level": "",
            "subject": "",
            "department": "",
            "semester": "",
            "course": "",
            "board": "",
            "chapter": "",
            "source": "Question Context",
        }

    # -----------------------------------------------------
    # UNIVERSITY
    # -----------------------------------------------------

    university_patterns = [
        r"\buniversity\b",
        r"\bundergraduate\b",
        r"\bgraduate\b",
        r"\bbachelor\b",
        r"\bbsc\b",
        r"\bbba\b",
        r"\bbeng\b",
        r"\bcse\b",
        r"\bsemester\b",
        r"\bthesis\b",
        r"\bresearch\b",
        r"\bengineering\b",
    ]

    if any(
        re.search(
            pattern,
            query
        )
        for pattern in university_patterns
    ):

        return {
            "level": "University",
            "class_level": "",
            "subject": "",
            "department": "",
            "semester": "",
            "course": "",
            "board": "",
            "chapter": "",
            "source": "Question Context",
        }

    # =====================================================
    # DEFAULT
    # =====================================================

    return {
        "level": "General Academic",
        "class_level": "",
        "subject": "",
        "department": "",
        "semester": "",
        "course": "",
        "board": "",
        "chapter": "",
        "source": "Adaptive Context",
    }


def get_tutor_academic_instruction(
    tutor_mode,
    difficulty="medium",
    note=None,
    query="",
):
    """
    Build adaptive academic behavior for the AI Tutor.
    Existing learning modes remain separate.
    """

    tutor_mode = (
        tutor_mode or "teach"
    ).strip().lower()

    difficulty = (
        difficulty or "medium"
    ).strip().lower()

    academic_profile = ""

    if note:
        academic_profile = (
            build_academic_context_block(note)
        )

    query_academic_context = (
        infer_query_academic_context(
            query
        )
    )

    if tutor_mode == "explore":

        return f"""
You are NoteShare AI Tutor in OPEN ACADEMIC LEARNING MODE.

Your purpose is to help the student learn academic subjects
beyond the boundaries of the uploaded NoteShare materials.

{academic_profile}

{query_academic_context}

CURRENT DIFFICULTY:
{difficulty}

ACADEMIC CONTEXT PRIORITY:

1. Explicit academic metadata from a selected NoteShare note
   is the strongest available academic-level signal.

2. Explicit academic-level signals in the student's question
   are the next strongest signal.

3. If neither provides a reliable level, use clear,
   academically accurate language with moderate depth.
   Do not falsely claim to know the student's academic level.

4. Never make the response more advanced merely because a
   university-level keyword appears in an unrelated context.

ACADEMIC ADAPTATION RULES:

1. Identify the student's likely academic level from the
   available NoteShare metadata.

2. For SCHOOL students:
   - Use clear, age-appropriate language.
   - Introduce the core idea before details.
   - Prefer familiar examples and visual/intuitive analogies.
   - Avoid unnecessary technical jargon.
   - Keep formulas and terminology appropriate to the class.
   - For exam questions, emphasize understanding before memorization.

3. For COLLEGE students:
   - Use structured academic language.
   - Explain concepts with moderate technical depth.
   - Include definitions, mechanisms, examples, and exam-relevant reasoning.
   - Connect related ideas when useful.
   - Do not oversimplify concepts that require deeper explanation.

4. For UNIVERSITY students:
   - Use precise technical terminology.
   - Explain mechanisms, assumptions, relationships, and edge cases when relevant.
   - For technical subjects, include algorithms, equations, derivations,
     complexity, implementation details, or analytical reasoning when appropriate.
   - Encourage critical thinking rather than memorized responses.
   - Do not oversimplify university-level material unnecessarily.

OPEN TOPIC BEHAVIOR:

1. The student may ask about ANY academic topic.
2. The selected NoteShare note is useful context when relevant,
   but it is NOT a mandatory knowledge boundary.
3. If the requested topic is not present in the selected note,
   answer using reliable general academic knowledge.
4. Clearly distinguish between information grounded in the
   selected NoteShare material and general academic explanation
   when that distinction matters.
5. Never invent facts, formulas, citations, statistics, or claims.
6. Break difficult concepts into logical steps.
7. Use examples, analogies, equations, or pseudo-code when
   they genuinely improve understanding.
8. Encourage understanding instead of simply dumping an answer.
9. Handle follow-up questions naturally and preserve the
   learning context of the conversation.
10. When appropriate, finish with a concise understanding-check
    question.

DIFFICULTY GUIDANCE:

EASY:
- Fundamentals
- Simple language
- Guided examples

MEDIUM:
- Conceptual depth
- Moderate reasoning
- Applied examples

HARD:
- Deeper reasoning
- Multi-step analysis
- Challenging applications

Important:
The student-selected difficulty is fixed for the session.
Do not silently change it.
"""

    if tutor_mode == "quiz":

        return f"""
You are NoteShare AI Tutor in ADAPTIVE QUIZ MODE.

{academic_profile}

Current difficulty:
{difficulty}

Your role is to assess genuine understanding.

Rules:
1. Ask exactly ONE question at a time.
2. Do not reveal the answer before the student responds.
3. Prefer conceptual understanding over memorization.
4. Evaluate the student's latest response accurately.
5. Explain why an answer is correct, partially correct,
   or incorrect.
6. Identify the main concept involved.
7. Use the selected academic level to determine appropriate
   vocabulary and complexity.
8. Keep note-grounded questions based primarily on the
   supplied NoteShare material.
9. If the student asks a follow-up academic clarification,
   answer it clearly before continuing the quiz.
10. Do not fabricate statistics or claim mastery from limited evidence.

The selected difficulty is fixed for this session.
"""

    return f"""
You are NoteShare AI Tutor in TEACH MODE.

{academic_profile}

Current difficulty:
{difficulty}

Your job is to teach the student clearly and progressively.

Rules:
1. Start from the student's likely knowledge level.
2. Explain step by step.
3. Use examples, analogies, and practical applications when useful.
4. Adapt vocabulary and depth to School, College, or University level.
5. Encourage active understanding.
6. Ask concise understanding-check questions when appropriate.
7. If the student is confused, simplify without becoming inaccurate.
8. Use the selected NoteShare material as the primary source when relevant.
9. Do not invent information.
10. Preserve continuity across follow-up questions.

The selected difficulty is fixed for this session.
"""
    


def find_relevant_notes(query, max_notes=3):
    """
    Find relevant notes using:
    - title
    - department
    - description
    - extracted PDF/OCR content

    If a specific person's name is found in a note,
    prioritize that person's note to avoid mixing
    information from unrelated documents.
    """

    notes = Note.objects.all()

    query_lower = query.lower().strip()

    query_words = set(
        re.findall(
            r"\b[a-zA-Z0-9]+\b",
            query_lower
        )
    )

    scored_notes = []

    for note in notes:

        # ==========================================
        # NOTE METADATA
        # ==========================================

        education_level = (
            note.education_level or ""
        )

        academic_context = " ".join([
            education_level,
            note.department or "",
            note.class_level or "",
            note.subject or "",
            note.chapter or "",
            note.board or "",
            note.semester or "",
            note.course or "",
        ])


        metadata_text = " ".join([
            note.title or "",
            academic_context,
            note.description or "",
        ]).lower()

        # ==========================================
        # NOTE CONTENT
        # ==========================================

        note_text = get_note_text(note)

        combined_text = (
            metadata_text +
            " " +
            note_text.lower()
        )

        content_words = set(
            re.findall(
                r"\b[a-zA-Z0-9]+\b",
                combined_text
            )
        )

        # ==========================================
        # WORD MATCHING
        # ==========================================

        matches = query_words.intersection(
            content_words
        )

        score = len(matches)

        # Metadata gets extra weight
        metadata_words = set(
            re.findall(
                r"\b[a-zA-Z0-9]+\b",
                metadata_text
            )
        )

        metadata_matches = query_words.intersection(
            metadata_words
        )

        score += len(metadata_matches) * 3

        # ==========================================
        # PERSON NAME MATCH
        # ==========================================

        # Look for possible two-word person names
        query_name_candidates = []

        words = list(query_words)

        for i in range(len(words)):
            for j in range(i + 1, len(words)):

                word1 = words[i]
                word2 = words[j]

                if (
                    len(word1) >= 3
                    and len(word2) >= 3
                    and word1 not in {
                        "what",
                        "where",
                        "when",
                        "which",
                        "who",
                        "does",
                        "did",
                        "the",
                        "is",
                        "are",
                        "was",
                        "were",
                        "has",
                        "have",
                        "his",
                        "her",
                        "their",
                        "this",
                        "that",
                        "from",
                        "about",
                    }
                ):
                    query_name_candidates.append(
                        (word1, word2)
                    )

        # Strongly prioritize a note containing
        # both words of a possible person's name
        for word1, word2 in query_name_candidates:

            if (
                word1 in combined_text
                and word2 in combined_text
            ):

                score += 20

            elif (
                word1 in combined_text
                or word2 in combined_text
            ):

                score += 5

        # ==========================================
        # SAVE RELEVANT NOTES
        # ==========================================

        if score > 0:

            scored_notes.append(
                (
                    score,
                    note
                )
            )

    # ==========================================
    # PERSON-SPECIFIC FILTER
    # ==========================================

    if scored_notes:

        query_name_words = []

        for word in query_words:

            if (
                len(word) >= 3
                and word not in {
                    "what",
                    "where",
                    "when",
                    "which",
                    "who",
                    "does",
                    "did",
                    "the",
                    "is",
                    "are",
                    "was",
                    "were",
                    "has",
                    "have",
                    "his",
                    "her",
                    "their",
                    "this",
                    "that",
                    "from",
                    "about",
                }
            ):
                query_name_words.append(word)

        name_matched_notes = []

        for score, note in scored_notes:

            note_text = get_note_text(note).lower()

            matched_name_words = [
                word
                for word in query_name_words
                if word in note_text
            ]

            if len(matched_name_words) >= 2:
                name_matched_notes.append(
                    (
                        score,
                        note
                    )
                )

        if name_matched_notes:

            scored_notes = name_matched_notes


    # ==========================================
    # SORT BY RELEVANCE
    # ==========================================

    scored_notes.sort(
        key=lambda item: item[0],
        reverse=True
    )

    # ==========================================
    # RETURN RELEVANT NOTES
    # ==========================================

    if not scored_notes:
        return []

    # Best matching score
    best_score = scored_notes[0][0]

    # Only keep notes that are reasonably close
    # to the best matching note.
    relevant_notes = [
        note
        for score, note in scored_notes
        if score >= best_score * 0.6
    ]

    return relevant_notes[:max_notes]


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def ai_chat(request):

    print("NEW AI CHAT CODE IS RUNNING")

    message = request.data.get(
        "message",
        ""
    ).strip()

    academic_query = (
        request.data.get(
            "academic_query",
            ""
        ) or ""
    ).strip()

    if not message:
        return Response(
            {
                "error": "Message is required."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # =====================================================
    # TUTOR CONTEXT
    # =====================================================

    tutor_mode = (
        request.data.get(
            "tutor_mode",
            ""
        ) or ""
    ).strip().lower()

    note_id = request.data.get(
        "note_id"
    )

    difficulty = (
        request.data.get(
            "difficulty",
            "medium"
        ) or "medium"
    ).strip().lower()

    valid_modes = {
        "teach",
        "quiz",
        "explore",
    }

    if tutor_mode not in valid_modes:
        tutor_mode = ""

    # =====================================================
    # SELECTED NOTE
    # =====================================================

    selected_note = None

    if note_id:

        try:
            selected_note = Note.objects.get(
                id=int(note_id)
            )

        except (
            ValueError,
            TypeError,
            Note.DoesNotExist
        ):
            selected_note = None

    # =====================================================
    # NOTE AVAILABILITY QUESTIONS
    # =====================================================

    availability_keywords = [
        "what notes",
        "which notes",
        "available notes",
        "list notes",
        "show notes",
        "what documents",
        "which documents",
    ]

    message_lower = message.lower()

    if (
        any(
            keyword in message_lower
            for keyword in availability_keywords
        )
        and tutor_mode != "explore"
    ):

        all_notes = (
            Note.objects
            .all()
            .order_by("-uploaded_at")
        )

        note_names = [
            f"{index}. {note.title}"
            for index, note in enumerate(
                all_notes,
                start=1
            )
        ]

        reply = (
            "The following notes are currently available "
            "in NoteShare:\n\n"
            + "\n".join(note_names)
        )

        return Response({

            "reply": reply,

            "sources": [
                {
                    "id": note.id,
                    "title": note.title,
                }
                for note in all_notes
            ],

        })

    # =====================================================
    # FIND RELEVANT NOTES
    # =====================================================

    all_notes = list(
        Note.objects
        .all()
        .order_by("-uploaded_at")
    )

    relevant_notes = []

    # -----------------------------------------------------
    # Selected note gets priority for Tutor
    # -----------------------------------------------------

    if selected_note:

        relevant_notes.append(
            selected_note
        )

    # -----------------------------------------------------
    # Exact title matching
    # -----------------------------------------------------

    exact_matches = []

    for note in all_notes:

        title = (
            note.title or ""
        ).strip().lower()

        if not title:
            continue

        if title == message_lower:

            exact_matches.append(
                note
            )

            continue

        title_pattern = (
            rf"\b{re.escape(title)}\b"
        )

        if re.search(
            title_pattern,
            message_lower
        ):

            exact_matches.append(
                note
            )

    # -----------------------------------------------------
    # Metadata matching
    # -----------------------------------------------------

    query_words = set(
        re.findall(
            r"\b[a-zA-Z0-9]+\b",
            message_lower
        )
    )

    scored_notes = []

    for note in all_notes:

        title = (
            note.title or ""
        ).lower()

        education_level = (
            note.education_level or ""
        ).lower()

        department = (
            note.department or ""
        ).lower()

        class_level = (
            note.class_level or ""
        ).lower()

        subject = (
            note.subject or ""
        ).lower()

        chapter = (
            note.chapter or ""
        ).lower()

        board = (
            note.board or ""
        ).lower()

        semester = (
            note.semester or ""
        ).lower()

        course = (
            note.course or ""
        ).lower()

        description = (
            note.description or ""
        ).lower()

        metadata_text = (
            f"{title} "
            f"{education_level} "
            f"{department} "
            f"{class_level} "
            f"{subject} "
            f"{chapter} "
            f"{board} "
            f"{semester} "
            f"{course} "
            f"{description}"
        )

        metadata_words = set(
            re.findall(
                r"\b[a-zA-Z0-9]+\b",
                metadata_text
            )
        )

        matches = query_words.intersection(
            metadata_words
        )

        score = len(matches)

        title_words = set(
            re.findall(
                r"\b[a-zA-Z0-9]+\b",
                title
            )
        )

        title_matches = (
            query_words.intersection(
                title_words
            )
        )

        score += (
            len(title_matches) * 20
        )

        description_words = set(
            re.findall(
                r"\b[a-zA-Z0-9]+\b",
                description
            )
        )

        score += (
            len(
                query_words.intersection(
                    description_words
                )
            ) * 5
        )

        if score > 0:

            scored_notes.append(
                (
                    score,
                    note
                )
            )

    scored_notes.sort(
        key=lambda item: item[0],
        reverse=True
    )

    metadata_matches = [
        note
        for score, note in scored_notes[:3]
    ]

    # -----------------------------------------------------
    # Existing advanced relevance system
    # -----------------------------------------------------

    fallback_notes = find_relevant_notes(
        message,
        max_notes=3
    )

    # -----------------------------------------------------
    # Combine without duplicates
    # -----------------------------------------------------

    combined_candidates = []

    for note in (
        exact_matches
        + relevant_notes
        + metadata_matches
        + fallback_notes
    ):

        if not any(
            existing.id == note.id
            for existing in combined_candidates
        ):
            combined_candidates.append(
                note
            )

    # -----------------------------------------------------
    # Tutor selected note remains primary
    # -----------------------------------------------------

    if selected_note:

        combined_candidates = [
            selected_note
        ] + [
            note
            for note in combined_candidates
            if note.id != selected_note.id
        ]

    relevant_notes = (
        combined_candidates[:3]
    )

    # =====================================================
    # GEMINI CLIENT
    # =====================================================

    try:

        client = genai.Client(
            api_key=os.getenv(
                "GEMINI_API_KEY"
            )
        )

    except Exception as error:

        print(
            "Gemini Client Error:",
            error
        )

        return Response(
            {
                "error":
                    "Gemini AI is currently unavailable."
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    # =====================================================
    # SYSTEM INSTRUCTION
    # =====================================================

    academic_reference_note = (
        selected_note
        or (
            relevant_notes[0]
            if relevant_notes
            else None
        )
    )

    # Explore mode should follow the student's explicit
    # academic question before falling back to a NoteShare note.
    if tutor_mode == "explore" and academic_query:
        academic_context = build_ai_academic_context(
            note=None,
            query=academic_query,
        )
    else:
        academic_context = build_ai_academic_context(
            note=academic_reference_note,
            query=academic_query or message,
        )

    print("ACADEMIC CONTEXT:", academic_context)


    if tutor_mode:

        system_prompt = get_tutor_academic_instruction(
            tutor_mode=tutor_mode,
            difficulty=difficulty,
            note=academic_reference_note,
            query=academic_query or message,
        )

    else:

        system_prompt = """
You are NoteShare AI Assistant.

Your job is to answer questions using relevant
NoteShare academic materials.

Rules:

1. Use relevant uploaded notes when available.
2. Do not invent information.
3. If the user's question refers to a specific note,
   prioritize that note.
4. Keep answers clear, useful, and student-friendly.
5. Do not mix unrelated notes unnecessarily.
6. When academic metadata is provided, respect the
   student's education level and subject context.
"""

    # =====================================================
    # CONTENTS
    # =====================================================

    contents = []

    contents.append(
        system_prompt
    )

    contents.append(
        f"""
USER QUESTION:

{message}
"""
    )

    # =====================================================
    # ADD ACADEMIC CONTEXT
    # =====================================================

    sources = []

    for note in relevant_notes[:3]:

        sources.append({
            "id": note.id,
            "title": note.title,
        })

        academic_metadata = (
            build_academic_context_block(
                note
            )
        )

        contents.append(
            f"""
--- NOTE: {note.title} ---

{academic_metadata}
"""
        )

        # =================================================
        # NOTE TEXT
        # =================================================

        extracted_text = get_note_text(
            note
        )

        if extracted_text:

            extracted_text = (
                extracted_text[:12000]
            )

            contents.append(
                f"""
--- NOTE TEXT: {note.title} ---

{extracted_text}
"""
            )

            continue

        # =================================================
        # DIRECT FILE INPUT
        # =================================================

        try:

            if not note.file:
                continue

            file_url = note.file.url

            file_response = requests.get(
                file_url,
                timeout=30
            )

            file_response.raise_for_status()

            file_bytes = (
                file_response.content
            )

            mime_type = (
                file_response.headers
                .get(
                    "Content-Type",
                    ""
                )
                .split(";")[0]
                .strip()
            )

            if not mime_type:

                mime_type, _ = (
                    mimetypes.guess_type(
                        note.file.name
                    )
                )

            if not mime_type:

                if (
                    note.file.name
                    .lower()
                    .endswith(".pdf")
                ):

                    mime_type = (
                        "application/pdf"
                    )

                else:

                    mime_type = (
                        "image/jpeg"
                    )

            contents.append(
                f"""
--- NOTE FILE: {note.title} ---

This is the actual uploaded NoteShare
academic file.

Inspect the file directly when necessary.
"""
            )

            contents.append(
                types.Part.from_bytes(
                    data=file_bytes,
                    mime_type=mime_type
                )
            )

        except Exception as error:

            print(
                f"Gemini file input error for "
                f"{note.title}:",
                error
            )

    # =====================================================
    # NO NOTES + NON-EXPLORE REQUEST
    # =====================================================

    if (
        not relevant_notes
        and tutor_mode != "explore"
        and not selected_note
    ):

        return Response({

            "reply": (
                "I could not identify a relevant "
                "NoteShare note for this learning request."
            ),

            "sources": [],

        })

    # =====================================================
    # GEMINI REQUEST
    # =====================================================

    try:

        response = client.models.generate_content(

            model="gemini-3.1-flash-lite",

            contents=contents,

            config=types.GenerateContentConfig(
                system_instruction=system_prompt
            ),

        )

        reply = (
            response.text
            or "No response received from AI."
        )

        print("RETURNING ACADEMIC CONTEXT:", academic_context)

        return Response({

            "reply": reply,

            "sources": sources,

            "academic_context": academic_context,

        })

    except Exception as error:

        print(
            "Gemini Error:",
            error
        )

        return Response(

            {
                "error":
                    "Gemini AI is currently unavailable.",
                "details":
                    str(error),
            },

            status=status.HTTP_503_SERVICE_UNAVAILABLE

        )



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def notification_list(request):
    try:
        limit = min(max(int(request.GET.get("limit", 20)), 1), 50)
    except (TypeError, ValueError):
        limit = 20

    notifications = Notification.objects.filter(
        recipient=request.user
    ).select_related("actor").order_by("-created_at")[:limit]

    return Response({
        "notifications": [
            {
                "id": item.id,
                "type": item.notification_type,
                "title": item.title,
                "message": item.message,
                "link": item.link,
                "is_read": item.is_read,
                "created_at": item.created_at,
                "read_at": item.read_at,
                "actor": item.actor.username if item.actor else None,
                "actor_id": item.actor.id if item.actor else None,
            }
            for item in notifications
        ],
        "unread_count": Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).count(),
    })


@api_view(["POST", "PATCH"])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, id):
    notification = get_object_or_404(
        Notification,
        id=id,
        recipient=request.user,
    )

    if not notification.is_read:
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save(update_fields=["is_read", "read_at"])

    return Response({
        "message": "Notification marked as read."
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_notifications_read(request):
    updated = Notification.objects.filter(
        recipient=request.user,
        is_read=False
    ).update(
        is_read=True,
        read_at=timezone.now(),
    )

    return Response({
        "message": "All notifications marked as read.",
        "updated": updated,
    })
