from django.urls import path
from . import views

urlpatterns = [


# Home
path("", views.home, name="home"),

# ==========================
# Notes API
# ==========================

path("api/notes/", views.note_list),
path("api/notes/create/", views.create_note),
path("api/notes/delete/<int:pk>/", views.delete_note),
path("api/notes/update/<int:id>/", views.update_note),
path("api/notes/<int:id>/", views.note_detail),
path("api/notes/download/<int:id>/", views.download_note),

path(
    "api/notes/<int:id>/extract-text/",
    views.extract_note_text,
    name="extract-note-text"
),

# Dashboard
path("api/dashboard/", views.dashboard_stats),

# Profile
path(
    "api/profile/",
    views.user_profile,
    name="profile"
),

path(
    "api/profile/update/",
    views.update_user_profile,
    name="update-profile"
),

path(
    "api/profile/change-password/",
    views.change_password,
    name="change-password"
),

path(
    "api/profile/delete-account/",
    views.delete_account,
    name="delete-account"
),

# ==========================
# Authentication
# ==========================

path("api/register/", views.register_user),

# ==========================
# Blogs API
# ==========================

path("api/blogs/", views.blog_list),
path("api/blogs/create/", views.create_blog),
path("api/blogs/<int:id>/", views.blog_detail),
path("api/blogs/update/<int:id>/", views.update_blog),
path("api/blogs/delete/<int:id>/", views.delete_blog),

# ==========================
# Discussion Rooms API
# ==========================

# All rooms
path(
    "api/discussion/rooms/",
    views.discussion_rooms,
    name="discussion-rooms"
),

# Create room
path(
    "api/discussion/rooms/create/",
    views.create_discussion_room,
    name="create-discussion-room"
),

# Single room
path(
    "api/discussion/rooms/<int:id>/",
    views.discussion_room_detail,
    name="discussion-room-detail"
),

path(
    "api/discussion-rooms/<int:id>/children/",
    views.discussion_child_rooms,
),

# Join room
path(
    "api/discussion/rooms/<int:id>/join/",
    views.join_discussion_room,
    name="join-discussion-room"
),

# Leave room
path(
    "api/discussion/rooms/<int:id>/leave/",
    views.leave_discussion_room,
    name="leave-discussion-room"
),

# Messages
path(
    "api/discussion/rooms/<int:room_id>/messages/",
    views.discussion_messages,
    name="discussion-messages"
),

# Send message
path(
    "api/discussion/rooms/<int:room_id>/messages/create/",
    views.create_discussion_message,
    name="create-discussion-message"
),


# ==========================
# AI Assistant API
# ==========================

path(
    "api/ai/chat/",
    views.ai_chat,
    name="ai-chat"
),


# ==========================
# Social Login
# ==========================


path(
    "api/social-login/complete/",
    views.social_login_complete,
    name="social-login-complete",
),

path(
    "api/social-login/token/",
    views.social_login_token,
    name="social-login-token",
),

]