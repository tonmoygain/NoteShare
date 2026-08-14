from django.shortcuts import render, get_object_or_404
from django.core.paginator import Paginator

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

from .models import (
    Note,
    Blog,
    DiscussionRoom,
    DiscussionMessage,
    UserProfile,
)

from .serializers import (
    NoteSerializer,
    BlogSerializer,
    DiscussionRoomSerializer,
    DiscussionMessageSerializer,
    UserProfileSerializer,
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

    if serializer.is_valid():

        serializer.save(uploader=request.user)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
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

    # Increase Download Count
    note.downloads += 1
    note.save(update_fields=["downloads"])

    return FileResponse(
        note.file.open("rb"),
        as_attachment=True,
        filename=note.file.name.split("/")[-1]
    )

@api_view(["GET"])
def dashboard_stats(request):

    total_notes = Note.objects.count()

    total_views = Note.objects.aggregate(
        total=Sum("views")
    )["total"] or 0

    total_downloads = Note.objects.aggregate(
        total=Sum("downloads")
    )["total"] or 0

    featured_notes = Note.objects.filter(
        featured=True
    ).count()

    most_downloaded = Note.objects.order_by("-downloads")[:5]
    most_viewed = Note.objects.order_by("-views")[:5]

    return Response({

        "total_notes": total_notes,

        "total_views": total_views,

        "total_downloads": total_downloads,

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

    if serializer.is_valid():

        serializer.save(author=request.user)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
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

    blog.delete()

    return Response({

        "message": "Blog deleted successfully"

    })

@api_view(["PUT"])
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

    room.members.add(request.user)

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

    room.members.remove(request.user)

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

    return Response(
        serializer.data,
        status=status.HTTP_201_CREATED
    )

# =====================================================
# GOOGLE SOCIAL LOGIN → SIMPLE JWT
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
        "http://localhost:5173/social-callback"
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