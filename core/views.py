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

        metadata_text = " ".join([
            note.title or "",
            note.department or "",
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

    message = request.data.get("message", "").strip()

    if not message:
        return Response(
            {
                "error": "Message is required."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ==========================================
    # NOTE AVAILABILITY QUESTIONS
    # ==========================================

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

    if any(
        keyword in message_lower
        for keyword in availability_keywords
    ):

        all_notes = Note.objects.all().order_by("-uploaded_at")

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


    # ==========================================
    # SELECT RELEVANT NOTES
    # ==========================================

    message_lower = message.lower().strip()

    all_notes = list(
        Note.objects.all().order_by("-uploaded_at")
    )

    # -------------------------------------------------
    # 1. Exact title match gets absolute priority
    # -------------------------------------------------

    exact_matches = []

    for note in all_notes:

        title = (note.title or "").strip().lower()

        if not title:
            continue

        if title == message_lower:
            exact_matches.append(note)
            continue

        # Example:
        # "What is the COC note about?"
        # should match note title "COC"

        title_pattern = rf"\b{re.escape(title)}\b"

        if re.search(
            title_pattern,
            message_lower
        ):
            exact_matches.append(note)

    if exact_matches:

        relevant_notes = exact_matches[:3]

    else:

        # -------------------------------------------------
        # 2. Metadata-based matching
        # -------------------------------------------------

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

            department = (
                note.department or ""
            ).lower()

            description = (
                note.description or ""
            ).lower()

            metadata_text = (
                f"{title} "
                f"{department} "
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

            title_matches = query_words.intersection(
                title_words
            )

            score += len(title_matches) * 20

            description_words = set(
                re.findall(
                    r"\b[a-zA-Z0-9]+\b",
                    description
                )
            )

            score += len(
                query_words.intersection(
                    description_words
                )
            ) * 5

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

        relevant_notes = [
            note
            for score, note in scored_notes[:3]
        ]

        # -------------------------------------------------
        # 3. Existing relevance system as final fallback
        # -------------------------------------------------

        if not relevant_notes:

            relevant_notes = find_relevant_notes(
                message,
                max_notes=3
            )
    

    # ==========================================
    # GEMINI CLIENT
    # ==========================================

    try:

        client = genai.Client(
            api_key=os.getenv("GEMINI_API_KEY")
        )

    except Exception as error:

        print("Gemini Client Error:", error)

        return Response(
            {
                "error":
                    "Gemini AI is currently unavailable."
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    # ==========================================
    # BUILD GEMINI CONTENT
    # ==========================================

    contents = []

    system_prompt = """
You are NoteShare AI Assistant.

Your job is to answer questions using the
uploaded notes selected by the NoteShare system.

Rules:

1. Answer primarily from the provided note files
   and extracted note text.

2. If a note file is provided as an image or PDF,
   inspect the file directly.

3. Do not invent information.

4. If the requested information is not present
   in the provided notes, clearly say so.

5. Do not use unrelated notes to answer a question
   about a specific note.

6. If the user mentions a specific note title,
   prioritize that exact note.

7. Keep answers clear and student-friendly.
"""

    contents.append(system_prompt)

    contents.append(
        f"""
User Question:

{message}

Use the following NoteShare materials to answer.
"""
    )

    sources = []

    # ==========================================
    # ADD SELECTED NOTES
    # ==========================================

    for note in relevant_notes[:3]:

        sources.append({
            "id": note.id,
            "title": note.title,
        })

        extracted_text = get_note_text(note)

        if extracted_text:

            extracted_text = extracted_text[:12000]

            contents.append(
                f"""
--- NOTE TEXT: {note.title} ---

{extracted_text}
"""
            )

            continue

        # ==========================================
        # FALLBACK: DIRECT FILE INPUT
        # ==========================================

        try:

            file_url = note.file.url

            file_response = requests.get(
                file_url,
                timeout=30
            )

            file_response.raise_for_status()

            file_bytes = file_response.content

            # Cloudinary provides the real MIME type in the response header.
            mime_type = (
                file_response.headers.get("Content-Type", "")
                .split(";")[0]
                .strip()
            )

            # Fallback for any unusual case.
            if not mime_type:

                mime_type, _ = mimetypes.guess_type(
                    note.file.name
                )

            if not mime_type:

                if note.file.name.lower().endswith(".pdf"):
                    mime_type = "application/pdf"
                else:
                    mime_type = "image/jpeg"

            contents.append(
                f"""
            --- NOTE FILE: {note.title} ---

            This file is the actual uploaded NoteShare file.
            If it is an image, inspect the visual content directly.
            If it is a PDF, read the document content directly.
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

    # ==========================================
    # NO MATERIAL FOUND
    # ==========================================

    if not relevant_notes:

        return Response({
            "reply": (
                "I could not identify a relevant uploaded "
                "note for this question."
            ),
            "sources": [],
        })

    # ==========================================
    # GEMINI REQUEST
    # ==========================================

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

        return Response({

            "reply": reply,

            "sources": sources,

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