import os
from datetime import datetime, timedelta, timezone as dt_timezone

from django.conf import settings
from django.core.cache import cache

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from .models import GoogleCalendarConnection


# =========================================================
# GOOGLE CALENDAR CONFIG
# =========================================================

GOOGLE_CALENDAR_SCOPE = (
    "https://www.googleapis.com/auth/calendar.readonly"
)

GOOGLE_CLIENT_ID = os.getenv(
    "GOOGLE_CLIENT_ID",
    ""
)

GOOGLE_CLIENT_SECRET = os.getenv(
    "GOOGLE_CLIENT_SECRET",
    ""
)

GOOGLE_REDIRECT_URI = os.getenv(
    "GOOGLE_REDIRECT_URI",
    "http://127.0.0.1:8000/api/google-calendar/callback/"
)


# =========================================================
# GOOGLE OAUTH CLIENT CONFIG
# =========================================================

def get_google_client_config():
    return {
        "web": {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url":
                "https://www.googleapis.com/oauth2/v1/certs",
            "redirect_uris": [
                GOOGLE_REDIRECT_URI
            ],
        }
    }


# =========================================================
# CREATE OAUTH FLOW
# =========================================================

def create_google_flow(state=None):

    flow = Flow.from_client_config(
        get_google_client_config(),
        scopes=[
            GOOGLE_CALENDAR_SCOPE
        ],
        state=state,
        autogenerate_code_verifier=True,
    )

    flow.redirect_uri = GOOGLE_REDIRECT_URI

    return flow


# =========================================================
# CREATE AUTHORIZATION URL
# =========================================================

def get_google_authorization_url(user_id):

    flow = create_google_flow()

    authorization_url, state = (
        flow.authorization_url(
            access_type="offline",
            include_granted_scopes="true",
            prompt="consent",
        )
    )

    cache.set(
        f"google_calendar_oauth:{state}",
        {
            "user_id": user_id,
            "code_verifier": flow.code_verifier,
        },
        timeout=600,
    )

    return authorization_url


# =========================================================
# EXCHANGE AUTHORIZATION CODE
# =========================================================

def complete_google_authorization(request):

    state = request.GET.get(
        "state"
    )

    if not state:

        raise ValueError(
            "Missing OAuth state."
        )

    cache_key = (
        f"google_calendar_oauth:{state}"
    )

    oauth_data = cache.get(
        cache_key
    )

    if not oauth_data:

        raise ValueError(
            "Invalid or expired OAuth state."
        )

    # One-time state
    cache.delete(
        cache_key
    )

    user_id = oauth_data.get(
        "user_id"
    )

    code_verifier = oauth_data.get(
        "code_verifier"
    )

    if not user_id:

        raise ValueError(
            "Invalid OAuth user state."
        )

    flow = create_google_flow(
        state=state
    )

    flow.code_verifier = code_verifier

    flow.fetch_token(
        authorization_response=request.build_absolute_uri()
    )

    credentials = flow.credentials

    return user_id, credentials


# =========================================================
# SAVE USER CONNECTION
# =========================================================

def save_google_credentials(
    user,
    credentials
):

    expiry = credentials.expiry

    connection, created = (
        GoogleCalendarConnection.objects.get_or_create(
            user=user
        )
    )

    connection.access_token = (
        credentials.token or ""
    )

    if credentials.refresh_token:
        connection.refresh_token = (
            credentials.refresh_token
        )

    connection.token_expiry = expiry

    connection.scopes = ",".join(
        credentials.granted_scopes
        or credentials.scopes
        or []
    )

    connection.save()

    return connection


# =========================================================
# BUILD GOOGLE CREDENTIALS
# =========================================================

def get_user_credentials(user):

    try:

        connection = (
            GoogleCalendarConnection.objects.get(
                user=user
            )
        )

    except GoogleCalendarConnection.DoesNotExist:

        return None

    credentials = Credentials(
        token=connection.access_token,
        refresh_token=connection.refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        scopes=[
            GOOGLE_CALENDAR_SCOPE
        ],
    )

    if (
        credentials.expired
        and credentials.refresh_token
    ):

        credentials.refresh(
            Request()
        )

        connection.access_token = (
            credentials.token
        )

        connection.token_expiry = (
            credentials.expiry
        )

        connection.save(
            update_fields=[
                "access_token",
                "token_expiry",
                "updated_at",
            ]
        )

    return credentials


# =========================================================
# GOOGLE CALENDAR SERVICE
# =========================================================

def get_calendar_service(user):

    credentials = (
        get_user_credentials(user)
    )

    if not credentials:

        return None

    return build(
        "calendar",
        "v3",
        credentials=credentials,
        cache_discovery=False,
    )


# =========================================================
# CONNECTION STATUS
# =========================================================

def is_google_calendar_connected(user):

    return (
        GoogleCalendarConnection.objects
        .filter(user=user)
        .exists()
    )


# =========================================================
# UPCOMING EVENTS
# =========================================================

def get_upcoming_events(
    user,
    days=7,
    max_results=20,
):

    service = get_calendar_service(
        user
    )

    if not service:

        return []

    now = datetime.now(
        dt_timezone.utc
    )

    end_time = (
        now
        + timedelta(days=days)
    )

    try:

        response = (
            service.events()
            .list(
                calendarId="primary",
                timeMin=now.isoformat(),
                timeMax=end_time.isoformat(),
                maxResults=max_results,
                singleEvents=True,
                orderBy="startTime",
            )
            .execute()
        )

    except HttpError:

        return []

    events = []

    for event in response.get(
        "items",
        []
    ):

        start_data = event.get(
            "start",
            {}
        )

        end_data = event.get(
            "end",
            {}
        )

        start = (
            start_data.get("dateTime")
            or start_data.get("date")
        )

        end = (
            end_data.get("dateTime")
            or end_data.get("date")
        )

        events.append({

            "id": event.get(
                "id"
            ),

            "summary": event.get(
                "summary",
                "Untitled event"
            ),

            "start": start,

            "end": end,

            "location": event.get(
                "location",
                ""
            ),

            "description": event.get(
                "description",
                ""
            ),

            "html_link": event.get(
                "htmlLink",
                ""
            ),

            "is_all_day": (
                "date" in start_data
            ),

        })

    return events