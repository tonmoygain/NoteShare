import os
import re

from datetime import (
    datetime,
    timedelta,
    time,
    timezone as dt_timezone,
)

from zoneinfo import ZoneInfo

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
            "auth_uri": (
                "https://accounts.google.com/o/oauth2/auth"
            ),
            "token_uri": (
                "https://oauth2.googleapis.com/token"
            ),
            "auth_provider_x509_cert_url": (
                "https://www.googleapis.com/oauth2/v1/certs"
            ),
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

    if not code_verifier:

        raise ValueError(
            "Missing OAuth code verifier."
        )

    flow = create_google_flow(
        state=state
    )

    flow.code_verifier = code_verifier

    flow.fetch_token(
        authorization_response=(
            request.build_absolute_uri()
        )
    )

    credentials = flow.credentials

    return user_id, credentials


# =========================================================
# SAVE USER CONNECTION
# =========================================================

def save_google_credentials(
    user,
    credentials,
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
        token_uri=(
            "https://oauth2.googleapis.com/token"
        ),
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
        get_user_credentials(
            user
        )
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
        + timedelta(
            days=days
        )
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

    except HttpError as error:

        print(
            "Google Calendar API Error:",
            repr(error)
        )

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


# =========================================================
# SMART SCHEDULE INTELLIGENCE
# =========================================================

LOCAL_TIMEZONE = ZoneInfo(
    "Asia/Dhaka"
)


# =========================================================
# PARSE GOOGLE DATETIME
# =========================================================

def parse_calendar_datetime(value):

    if not value:

        return None

    try:

        normalized = value.replace(
            "Z",
            "+00:00"
        )

        parsed = datetime.fromisoformat(
            normalized
        )

        if parsed.tzinfo is None:

            parsed = parsed.replace(
                tzinfo=LOCAL_TIMEZONE
            )

        return parsed

    except (
        ValueError,
        TypeError,
    ):

        return None


# =========================================================
# PARSE TIME VALUE
# =========================================================

def parse_time_value(
    hour,
    minute=0,
    meridiem=None,
):

    hour = int(hour)

    minute = int(
        minute or 0
    )

    if meridiem:

        meridiem = (
            meridiem.lower()
        )

        if (
            meridiem == "pm"
            and hour < 12
        ):

            hour += 12

        elif (
            meridiem == "am"
            and hour == 12
        ):

            hour = 0

    return time(
        hour=hour,
        minute=minute,
    )


# =========================================================
# EXTRACT TIME TOKEN
# =========================================================

def extract_time_token(text):

    pattern = re.compile(
        r"\b"
        r"(1[0-2]|0?[1-9])"
        r"(?:[:.]([0-5][0-9]))?"
        r"\s*"
        r"(am|pm)?"
        r"\b",
        re.IGNORECASE,
    )

    twenty_four_pattern = re.compile(
        r"\b"
        r"(?:[01]?[0-9]|2[0-3])"
        r":"
        r"([0-5][0-9])"
        r"\b"
    )

    match = pattern.search(
        text
    )

    if match:

        hour = match.group(1)

        minute = (
            match.group(2)
            or "0"
        )

        meridiem = (
            match.group(3)
        )

        return parse_time_value(
            hour,
            minute,
            meridiem,
        )

    match_24 = twenty_four_pattern.search(
        text
    )

    if match_24:

        token = match_24.group(
            0
        )

        hour, minute = token.split(
            ":"
        )

        return parse_time_value(
            hour,
            minute,
        )

    return None


# =========================================================
# EXTRACT DURATION
# =========================================================

def extract_duration_minutes(
    text
):
    """
    Understand durations like:

    2 hours
    1.5 hours
    90 minutes
    45 mins
    1 hour
    """

    text = (
        text or ""
    ).lower()

    hour_match = re.search(
        r"\b(\d+(?:\.\d+)?)\s*hours?\b",
        text,
    )

    if hour_match:

        hours = float(
            hour_match.group(1)
        )

        return max(
            1,
            round(
                hours * 60
            ),
        )

    minute_match = re.search(
        r"\b(\d+)\s*(?:minutes?|mins?)\b",
        text,
    )

    if minute_match:

        return max(
            1,
            int(
                minute_match.group(1)
            ),
        )

    return None


# =========================================================
# QUERY DATE
# =========================================================

def get_query_date(
    query,
    base_date=None,
):

    if base_date is None:

        base_date = datetime.now(
            LOCAL_TIMEZONE
        ).date()

    text = (
        query or ""
    ).lower()

    if "tomorrow" in text:

        return (
            base_date
            + timedelta(
                days=1
            )
        )

    return base_date


# =========================================================
# BUILD SCHEDULE WINDOW
# =========================================================

def build_schedule_window(query):

    text = (
        query or ""
    ).strip().lower()

    today = datetime.now(
        LOCAL_TIMEZONE
    ).date()

    target_date = get_query_date(
        text,
        base_date=today,
    )

    # -----------------------------------------------------
    # RANGE QUERY
    # -----------------------------------------------------

    range_patterns = [
        (
            r"from\s+(.+?)\s+to\s+(.+?)"
            r"(?:\s+today|\s+tomorrow|$)"
        ),
        (
            r"between\s+(.+?)\s+and\s+(.+?)"
            r"(?:\s+today|\s+tomorrow|$)"
        ),
    ]

    for pattern in range_patterns:

        match = re.search(
            pattern,
            text,
            re.IGNORECASE,
        )

        if not match:

            continue

        first_text = match.group(1)

        second_text = match.group(2)

        first_time = extract_time_token(
            first_text
        )

        second_time = extract_time_token(
            second_text
        )

        if (
            first_time
            and second_time
        ):

            start = datetime.combine(
                target_date,
                first_time,
                tzinfo=LOCAL_TIMEZONE,
            )

            end = datetime.combine(
                target_date,
                second_time,
                tzinfo=LOCAL_TIMEZONE,
            )

            if end <= start:

                end += timedelta(
                    days=1
                )

            return {
                "type": "range",
                "start": start,
                "end": end,
                "date": target_date,
            }

    # -----------------------------------------------------
    # POINT-IN-TIME QUERY
    # -----------------------------------------------------

    target_time = extract_time_token(
        text
    )

    if target_time:

        start = datetime.combine(
            target_date,
            target_time,
            tzinfo=LOCAL_TIMEZONE,
        )

        end = (
            start
            + timedelta(
                minutes=1
            )
        )

        return {
            "type": "point",
            "start": start,
            "end": end,
            "date": target_date,
        }

    # -----------------------------------------------------
    # MORNING
    # -----------------------------------------------------

    if "morning" in text:

        start = datetime.combine(
            target_date,
            time(5, 0),
            tzinfo=LOCAL_TIMEZONE,
        )

        end = datetime.combine(
            target_date,
            time(12, 0),
            tzinfo=LOCAL_TIMEZONE,
        )

        return {
            "type": "period",
            "label": "morning",
            "start": start,
            "end": end,
            "date": target_date,
        }

    # -----------------------------------------------------
    # AFTERNOON
    # -----------------------------------------------------

    if "afternoon" in text:

        start = datetime.combine(
            target_date,
            time(12, 0),
            tzinfo=LOCAL_TIMEZONE,
        )

        end = datetime.combine(
            target_date,
            time(17, 0),
            tzinfo=LOCAL_TIMEZONE,
        )

        return {
            "type": "period",
            "label": "afternoon",
            "start": start,
            "end": end,
            "date": target_date,
        }

    # -----------------------------------------------------
    # EVENING
    # -----------------------------------------------------

    if "evening" in text:

        start = datetime.combine(
            target_date,
            time(17, 0),
            tzinfo=LOCAL_TIMEZONE,
        )

        end = datetime.combine(
            target_date,
            time(22, 0),
            tzinfo=LOCAL_TIMEZONE,
        )

        return {
            "type": "period",
            "label": "evening",
            "start": start,
            "end": end,
            "date": target_date,
        }

    return None


# =========================================================
# FIND SCHEDULE CONFLICTS
# =========================================================

def find_schedule_conflicts(
    events,
    start,
    end,
):

    conflicts = []

    for event in events:

        if event.get(
            "is_all_day"
        ):

            event_date_value = (
                event.get(
                    "start"
                )
            )

            try:

                event_date = (
                    datetime.fromisoformat(
                        event_date_value
                    ).date()
                )

            except (
                ValueError,
                TypeError,
            ):

                continue

            if (
                start.date()
                <= event_date
                <= end.date()
            ):

                conflicts.append(
                    event
                )

            continue

        event_start = (
            parse_calendar_datetime(
                event.get("start")
            )
        )

        event_end = (
            parse_calendar_datetime(
                event.get("end")
            )
        )

        if not event_start:

            continue

        if not event_end:

            event_end = (
                event_start
                + timedelta(
                    minutes=30
                )
            )

        if (
            event_start < end
            and event_end > start
        ):

            conflicts.append(
                event
            )

    return conflicts


# =========================================================
# FORMAT SCHEDULE EVENT
# =========================================================

def format_schedule_event(
    event
):

    title = (
        event.get(
            "summary"
        )
        or "Untitled event"
    )

    if event.get(
        "is_all_day"
    ):

        return (
            f"{title} "
            "(all day)"
        )

    start = (
        parse_calendar_datetime(
            event.get("start")
        )
    )

    end = (
        parse_calendar_datetime(
            event.get("end")
        )
    )

    if not start:

        return title

    start_text = (
        start.astimezone(
            LOCAL_TIMEZONE
        )
        .strftime(
            "%I:%M %p"
        )
        .lstrip("0")
    )

    if end:

        end_text = (
            end.astimezone(
                LOCAL_TIMEZONE
            )
            .strftime(
                "%I:%M %p"
            )
            .lstrip("0")
        )

        return (
            f"{title} · "
            f"{start_text}–{end_text}"
        )

    return (
        f"{title} · "
        f"{start_text}"
    )


# =========================================================
# SCHEDULE INTELLIGENCE RESPONSE
# =========================================================

def build_schedule_intelligence_response(
    query,
    events,
):

    schedule_window = (
        build_schedule_window(
            query
        )
    )

    if not schedule_window:

        return None

    start = schedule_window[
        "start"
    ]

    end = schedule_window[
        "end"
    ]

    conflicts = (
        find_schedule_conflicts(
            events,
            start,
            end,
        )
    )

    query_lower = (
        query or ""
    ).lower()

    asks_free = any(
        phrase in query_lower
        for phrase in [
            "am i free",
            "am i available",
            "is there any free",
            "can i study",
            "can i work",
            "can i schedule",
            "do i have time",
            "do i have a free",
        ]
    )

    # -----------------------------------------------------
    # CONFLICT FOUND
    # -----------------------------------------------------

    if conflicts:

        conflict_lines = [
            f"• {format_schedule_event(event)}"
            for event in conflicts[:4]
        ]

        if schedule_window[
            "type"
        ] == "point":

            return (
                "You're not free at that time. "
                "Your calendar has:\n\n"
                + "\n".join(
                    conflict_lines
                )
            )

        return (
            "That time overlaps with your calendar:\n\n"
            + "\n".join(
                conflict_lines
            )
            + "\n\n"
            "I would not recommend scheduling another "
            "task in that window."
        )

    # -----------------------------------------------------
    # NO CONFLICT
    # -----------------------------------------------------

    if asks_free:

        if schedule_window[
            "type"
        ] == "point":

            return (
                "Yes, you're free at that time. "
                "I don't see any overlapping calendar event."
            )

        label = (
            schedule_window.get(
                "label"
            )
        )

        if label:

            return (
                f"Yes, your {label} looks free. "
                "I don't see any overlapping calendar event."
            )

        return (
            "Yes, that time is currently free. "
            "I don't see any overlapping calendar event."
        )

    return (
        "I checked your calendar for that time "
        "and found no overlapping event."
    )


# =========================================================
# BEST FREE TIME SEARCH WINDOW
# =========================================================

def get_free_time_search_window(
    query
):

    text = (
        query or ""
    ).lower()

    now = datetime.now(
        LOCAL_TIMEZONE
    )

    target_date = get_query_date(
        text,
        base_date=now.date(),
    )

    # -----------------------------------------------------
    # MORNING
    # -----------------------------------------------------

    if "morning" in text:

        start = datetime.combine(
            target_date,
            time(8, 0),
            tzinfo=LOCAL_TIMEZONE,
        )

        end = datetime.combine(
            target_date,
            time(12, 0),
            tzinfo=LOCAL_TIMEZONE,
        )

    # -----------------------------------------------------
    # AFTERNOON
    # -----------------------------------------------------

    elif "afternoon" in text:

        start = datetime.combine(
            target_date,
            time(12, 0),
            tzinfo=LOCAL_TIMEZONE,
        )

        end = datetime.combine(
            target_date,
            time(17, 0),
            tzinfo=LOCAL_TIMEZONE,
        )

    # -----------------------------------------------------
    # EVENING
    # -----------------------------------------------------

    elif "evening" in text:

        start = datetime.combine(
            target_date,
            time(17, 0),
            tzinfo=LOCAL_TIMEZONE,
        )

        end = datetime.combine(
            target_date,
            time(22, 0),
            tzinfo=LOCAL_TIMEZONE,
        )

    # -----------------------------------------------------
    # DEFAULT
    # -----------------------------------------------------

    else:

        start = datetime.combine(
            target_date,
            time(8, 0),
            tzinfo=LOCAL_TIMEZONE,
        )

        end = datetime.combine(
            target_date,
            time(22, 0),
            tzinfo=LOCAL_TIMEZONE,
        )

    # Don't recommend a past time today.

    if target_date == now.date():

        start = max(
            start,
            now
        )

    return start, end


# =========================================================
# MERGE BUSY INTERVALS
# =========================================================

def merge_calendar_busy_intervals(
    events,
    window_start,
    window_end,
):

    intervals = []

    for event in events:

        # -------------------------------------------------
        # ALL DAY EVENT
        # -------------------------------------------------

        if event.get(
            "is_all_day"
        ):

            event_start_raw = (
                event.get(
                    "start"
                )
            )

            try:

                event_date = (
                    datetime.fromisoformat(
                        event_start_raw
                    ).date()
                )

            except (
                ValueError,
                TypeError,
            ):

                continue

            if (
                window_start.date()
                <= event_date
                <= window_end.date()
            ):

                all_day_start = (
                    datetime.combine(
                        event_date,
                        time.min,
                        tzinfo=LOCAL_TIMEZONE,
                    )
                )

                all_day_end = (
                    datetime.combine(
                        event_date
                        + timedelta(
                            days=1
                        ),
                        time.min,
                        tzinfo=LOCAL_TIMEZONE,
                    )
                )

                intervals.append(
                    (
                        max(
                            window_start,
                            all_day_start,
                        ),
                        min(
                            window_end,
                            all_day_end,
                        ),
                    )
                )

            continue

        # -------------------------------------------------
        # NORMAL EVENT
        # -------------------------------------------------

        event_start = (
            parse_calendar_datetime(
                event.get("start")
            )
        )

        event_end = (
            parse_calendar_datetime(
                event.get("end")
            )
        )

        if not event_start:

            continue

        if not event_end:

            event_end = (
                event_start
                + timedelta(
                    minutes=30
                )
            )

        if (
            event_end <= window_start
            or event_start >= window_end
        ):

            continue

        interval_start = max(
            event_start,
            window_start,
        )

        interval_end = min(
            event_end,
            window_end,
        )

        intervals.append(
            (
                interval_start,
                interval_end,
            )
        )

    intervals.sort(
        key=lambda item: item[0]
    )

    # -----------------------------------------------------
    # MERGE OVERLAPPING EVENTS
    # -----------------------------------------------------

    merged = []

    for start, end in intervals:

        if not merged:

            merged.append(
                [
                    start,
                    end,
                ]
            )

            continue

        previous_start, previous_end = (
            merged[-1]
        )

        if start <= previous_end:

            merged[-1][1] = max(
                previous_end,
                end
            )

        else:

            merged.append(
                [
                    start,
                    end,
                ]
            )

    return merged


# =========================================================
# FIND FREE WINDOWS
# =========================================================

def find_free_windows(
    events,
    window_start,
    window_end,
):

    busy_intervals = (
        merge_calendar_busy_intervals(
            events,
            window_start,
            window_end,
        )
    )

    free_windows = []

    cursor = window_start

    for busy_start, busy_end in busy_intervals:

        if busy_start > cursor:

            free_windows.append(
                (
                    cursor,
                    busy_start,
                )
            )

        if busy_end > cursor:

            cursor = busy_end

    if cursor < window_end:

        free_windows.append(
            (
                cursor,
                window_end,
            )
        )

    return free_windows


# =========================================================
# FORMAT SLOT TIME
# =========================================================

def format_slot_time(
    value
):

    return (
        value.astimezone(
            LOCAL_TIMEZONE
        )
        .strftime(
            "%I:%M %p"
        )
        .lstrip("0")
    )


# =========================================================
# FORMAT DURATION
# =========================================================

def format_duration(
    duration_minutes
):

    hours = duration_minutes // 60

    minutes = duration_minutes % 60

    if hours and minutes:

        return (
            f"{hours} hour "
            f"{minutes} minutes"
        )

    if hours == 1:

        return "1 hour"

    if hours > 1:

        return f"{hours} hours"

    return f"{minutes} minutes"


# =========================================================
# BUILD BEST FREE TIME RESPONSE
# =========================================================

def build_best_free_time_response(
    query,
    events,
):

    duration_minutes = (
        extract_duration_minutes(
            query
        )
    )

    if not duration_minutes:

        return None

    window_start, window_end = (
        get_free_time_search_window(
            query
        )
    )

    if window_start >= window_end:

        return (
            "There isn't enough remaining time "
            "in that period to schedule the requested task."
        )

    free_windows = (
        find_free_windows(
            events,
            window_start,
            window_end,
        )
    )

    required_delta = timedelta(
        minutes=duration_minutes
    )

    suitable_slots = []

    for free_start, free_end in free_windows:

        available_minutes = int(
            (
                free_end
                - free_start
            ).total_seconds()
            / 60
        )

        if (
            available_minutes
            >= duration_minutes
        ):

            slot_end = (
                free_start
                + required_delta
            )

            suitable_slots.append(
                {
                    "start": free_start,
                    "end": slot_end,
                    "available_minutes":
                        available_minutes,
                }
            )

    # -----------------------------------------------------
    # NO SUITABLE SLOT
    # -----------------------------------------------------

    if not suitable_slots:

        return (
            "I couldn't find a continuous "
            f"{format_duration(duration_minutes)} "
            "free slot in that period."
        )

    # -----------------------------------------------------
    # BEST SLOT
    #
    # Priority:
    # 1. Longest continuous free window
    # 2. Earliest start time
    # -----------------------------------------------------

    suitable_slots.sort(
        key=lambda slot: (
            -slot["available_minutes"],
            slot["start"],
        )
    )

    best_slot = suitable_slots[0]

    start_text = format_slot_time(
        best_slot["start"]
    )

    end_text = format_slot_time(
        best_slot["end"]
    )

    duration_text = format_duration(
        duration_minutes
    )

    available_text = format_duration(
        best_slot[
            "available_minutes"
        ]
    )

    return (
        f"Your best free slot is "
        f"{start_text}–{end_text} "
        f"for {duration_text}.\n\n"
        f"You have a continuous free window of "
        f"{available_text} there, with no calendar conflicts."
    )


# =========================================================
# ADVANCED SCHEDULE OVERVIEW HELPERS
# =========================================================

def format_event_date_label(event):
    """
    Return a readable date label for a calendar event.
    """

    if not event:
        return ""

    if event.get("is_all_day"):

        raw_date = event.get("start")

        try:
            event_date = datetime.fromisoformat(
                raw_date
            ).date()

            return event_date.strftime(
                "%A, %B %d"
            )

        except (
            ValueError,
            TypeError,
        ):
            return ""

    event_start = parse_calendar_datetime(
        event.get("start")
    )

    if not event_start:
        return ""

    return (
        event_start
        .astimezone(LOCAL_TIMEZONE)
        .strftime("%A, %B %d")
    )


def get_event_date(event):
    """
    Return the local calendar date of an event.
    """

    if not event:
        return None

    if event.get("is_all_day"):

        raw_date = event.get("start")

        try:
            return datetime.fromisoformat(
                raw_date
            ).date()

        except (
            ValueError,
            TypeError,
        ):
            return None

    event_start = parse_calendar_datetime(
        event.get("start")
    )

    if not event_start:
        return None

    return (
        event_start
        .astimezone(
            LOCAL_TIMEZONE
        )
        .date()
    )


def get_timed_future_events(events):
    """
    Return future timed events sorted chronologically.
    """

    now = datetime.now(
        LOCAL_TIMEZONE
    )

    future_events = []

    for event in events:

        if event.get(
            "is_all_day"
        ):
            continue

        event_start = parse_calendar_datetime(
            event.get("start")
        )

        if not event_start:
            continue

        event_start = event_start.astimezone(
            LOCAL_TIMEZONE
        )

        if event_start >= now:
            future_events.append(
                event
            )

    future_events.sort(
        key=lambda event: (
            parse_calendar_datetime(
                event.get("start")
            )
            or datetime.max.replace(
                tzinfo=LOCAL_TIMEZONE
            )
        )
    )

    return future_events


def get_next_class_event(events):
    """
    Find the nearest future class-like event.

    This is intentionally conservative so that ordinary
    meetings are not incorrectly reported as classes.
    """

    class_keywords = [
        "class",
        "lecture",
        "lab",
        "lesson",
        "tutorial",
        "course",
        "semester",
        "exam",
        "quiz",
        "cse",
    ]

    future_events = (
        get_timed_future_events(
            events
        )
    )

    for event in future_events:

        title = (
            event.get(
                "summary",
                ""
            )
            or ""
        ).lower()

        description = (
            event.get(
                "description",
                ""
            )
            or ""
        ).lower()

        event_text = (
            f"{title} {description}"
        )

        if any(
            keyword in event_text
            for keyword in class_keywords
        ):
            return event

    return None


def build_next_class_response(events):
    """
    Build a natural response for the user's next class.
    """

    next_class = get_next_class_event(
        events
    )

    if not next_class:

        return (
            "I couldn't identify your next class "
            "from the calendar events I can access."
        )

    event_label = format_schedule_event(
        next_class
    )

    event_date = format_event_date_label(
        next_class
    )

    if event_date:

        return (
            f"Your next class is "
            f"{event_label} on {event_date}."
        )

    return (
        f"Your next class is "
        f"{event_label}."
    )


def build_schedule_list_response(
    query,
    events,
):
    """
    Handle natural-language schedule overview questions.

    Supports:
    - today
    - tomorrow
    - tomorrow morning / afternoon / evening
    - before a time
    - after a time
    - next class
    - deadlines this week
    """

    query_lower = (
        query or ""
    ).strip().lower()

    now = datetime.now(
        LOCAL_TIMEZONE
    )

    # -----------------------------------------------------
    # NEXT CLASS
    # -----------------------------------------------------

    if (
        "when is my next class"
        in query_lower
        or "what is my next class"
        in query_lower
        or "what's my next class"
        in query_lower
    ):

        return build_next_class_response(
            events
        )

    # -----------------------------------------------------
    # TARGET DATE
    # -----------------------------------------------------

    target_date = now.date()

    if "tomorrow" in query_lower:

        target_date = (
            target_date
            + timedelta(days=1)
        )

    # -----------------------------------------------------
    # DEADLINES THIS WEEK
    # -----------------------------------------------------

    if (
        "deadline" in query_lower
        or "deadlines" in query_lower
    ):

        week_end = (
            target_date
            + timedelta(days=7)
        )

        deadline_events = []

        for event in events:

            event_date = get_event_date(
                event
            )

            if not event_date:
                continue

            if not (
                target_date
                <= event_date
                <= week_end
            ):
                continue

            event_text = " ".join([
                str(
                    event.get(
                        "summary",
                        ""
                    )
                    or ""
                ),
                str(
                    event.get(
                        "description",
                        ""
                    )
                    or ""
                ),
            ]).lower()

            if any(
                keyword in event_text
                for keyword in [
                    "deadline",
                    "due",
                    "submission",
                    "submit",
                ]
            ):

                deadline_events.append(
                    event
                )

        deadline_events.sort(
            key=lambda event: (
                get_event_date(event)
                or target_date
            )
        )

        if not deadline_events:

            return (
                "I couldn't find any calendar "
                "deadlines in the next 7 days."
            )

        lines = []

        for event in deadline_events[:8]:

            date_label = (
                format_event_date_label(
                    event
                )
            )

            lines.append(
                f"• {event.get('summary', 'Untitled event')}"
                f" · {date_label}"
            )

        return (
            "Here are your upcoming deadlines:\n\n"
            + "\n".join(lines)
        )

    # -----------------------------------------------------
    # PERIOD FILTER
    # -----------------------------------------------------

    period_start = None
    period_end = None
    period_label = None

    if "morning" in query_lower:

        period_start = time(
            5,
            0
        )

        period_end = time(
            12,
            0
        )

        period_label = "morning"

    elif "afternoon" in query_lower:

        period_start = time(
            12,
            0
        )

        period_end = time(
            17,
            0
        )

        period_label = "afternoon"

    elif "evening" in query_lower:

        period_start = time(
            17,
            0
        )

        period_end = time(
            22,
            0
        )

        period_label = "evening"

    # -----------------------------------------------------
    # BEFORE / AFTER TIME
    # -----------------------------------------------------

    reference_time = None

    if (
        "before" in query_lower
        or "after" in query_lower
    ):

        reference_time = extract_time_token(
            query_lower
        )

    # -----------------------------------------------------
    # COLLECT MATCHING EVENTS
    # -----------------------------------------------------

    matching_events = []

    for event in events:

        event_date = get_event_date(
            event
        )

        if event_date != target_date:
            continue

        if event.get(
            "is_all_day"
        ):

            matching_events.append(
                event
            )

            continue

        event_start = parse_calendar_datetime(
            event.get("start")
        )

        if not event_start:
            continue

        event_start = event_start.astimezone(
            LOCAL_TIMEZONE
        )

        event_time = event_start.time()

        if period_start and period_end:

            if not (
                period_start
                <= event_time
                < period_end
            ):
                continue

        if reference_time:

            if (
                "before" in query_lower
                and event_time >= reference_time
            ):
                continue

            if (
                "after" in query_lower
                and event_time <= reference_time
            ):
                continue

        matching_events.append(
            event
        )

    # -----------------------------------------------------
    # SORT
    # -----------------------------------------------------

    def event_sort_key(event):

        if event.get(
            "is_all_day"
        ):

            return datetime.combine(
                target_date,
                time.min,
                tzinfo=LOCAL_TIMEZONE,
            )

        event_start = parse_calendar_datetime(
            event.get("start")
        )

        if not event_start:
            return datetime.combine(
                target_date,
                time.max,
                tzinfo=LOCAL_TIMEZONE,
            )

        return event_start.astimezone(
            LOCAL_TIMEZONE
        )

    matching_events.sort(
        key=event_sort_key
    )

    # -----------------------------------------------------
    # NO EVENTS
    # -----------------------------------------------------

    if not matching_events:

        if period_label:

            return (
                f"You don't have any calendar events "
                f"scheduled for tomorrow's {period_label}."
                if "tomorrow" in query_lower
                else
                f"You don't have any calendar events "
                f"scheduled for today's {period_label}."
            )

        if "tomorrow" in query_lower:

            return (
                "You don't have any calendar events "
                "scheduled for tomorrow."
            )

        return (
            "You don't have any calendar events "
            "scheduled for today."
        )

    # -----------------------------------------------------
    # BUILD RESPONSE
    # -----------------------------------------------------

    if "tomorrow" in query_lower:

        heading = "Here's your schedule for tomorrow:"

    else:

        heading = "Here's your schedule for today:"

    if period_label:

        heading = (
            f"Here's your {period_label} schedule:"
        )

    if (
        "before" in query_lower
        and reference_time
    ):

        reference_datetime = datetime.combine(
            target_date,
            reference_time,
            tzinfo=LOCAL_TIMEZONE,
        )

        reference_time_text = format_slot_time(
            reference_datetime
        )

        heading = (
            f"Here's what you have before "
            f"{reference_time_text}:"
        )

    elif (
        "after" in query_lower
        and reference_time
    ):

        reference_datetime = datetime.combine(
            target_date,
            reference_time,
            tzinfo=LOCAL_TIMEZONE,
        )

        reference_time_text = format_slot_time(
            reference_datetime
        )

        heading = (
            f"Here's what you have after "
            f"{reference_time_text}:"
        )

    lines = [
        f"• {format_schedule_event(event)}"
        for event in matching_events[:8]
    ]

    return (
        heading
        + "\n\n"
        + "\n".join(lines)
    )

# =========================================================
# SMART SCHEDULE OVERVIEW
# =========================================================

def format_event_date_label(event):
    """
    Human-friendly calendar date label.
    """

    if not event or not event.get("start"):
        return ""

    if event.get("is_all_day"):
        try:
            event_date = datetime.fromisoformat(
                event["start"]
            ).date()

            return event_date.strftime(
                "%A, %b %d"
            )

        except (
            ValueError,
            TypeError,
        ):
            return ""

    start = parse_calendar_datetime(
        event.get("start")
    )

    if not start:
        return ""

    return (
        start.astimezone(
            LOCAL_TIMEZONE
        )
        .strftime("%A, %b %d")
    )


def get_event_date(event):
    """
    Return the event's local calendar date.
    """

    if not event or not event.get("start"):
        return None

    if event.get("is_all_day"):

        try:
            return datetime.fromisoformat(
                event["start"]
            ).date()

        except (
            ValueError,
            TypeError,
        ):
            return None

    start = parse_calendar_datetime(
        event.get("start")
    )

    if not start:
        return None

    return start.astimezone(
        LOCAL_TIMEZONE
    ).date()


def get_timed_future_events(events):
    """
    Return valid future timed events sorted by start time.
    """

    now = datetime.now(
        LOCAL_TIMEZONE
    )

    result = []

    for event in events:

        if event.get("is_all_day"):
            continue

        start = parse_calendar_datetime(
            event.get("start")
        )

        if not start:
            continue

        start = start.astimezone(
            LOCAL_TIMEZONE
        )

        if start >= now:

            result.append(
                (
                    start,
                    event
                )
            )

    result.sort(
        key=lambda item: item[0]
    )

    return [
        event
        for _, event in result
    ]


def get_next_class_event(events):
    """
    Identify the next likely academic class/lecture event.

    We intentionally use conservative keywords so random
    personal events are not presented as classes.
    """

    class_keywords = {
        "class",
        "lecture",
        "lab",
        "tutorial",
        "tutorial class",
        "seminar",
        "course",
        "lesson",
        "cse",
        "cs",
        "database",
        "operating system",
        "data structure",
        "algorithm",
        "software engineering",
        "computer network",
        "networking",
        "artificial intelligence",
        "machine learning",
        "web engineering",
        "web development",
        "programming",
        "mathematics",
        "math",
        "physics",
        "chemistry",
        "biology",
        "english",
        "accounting",
        "finance",
        "marketing",
        "management",
        "economics",
    }

    future_events = get_timed_future_events(
        events
    )

    for event in future_events:

        text = " ".join([
            event.get("summary", ""),
            event.get("description", ""),
        ]).lower()

        words = set(
            re.findall(
                r"\b[a-z0-9]+\b",
                text
            )
        )

        if words.intersection(
            class_keywords
        ):
            return event

    return None


def build_next_class_response(events):

    event = get_next_class_event(
        events
    )

    if not event:

        return (
            "I couldn't identify a specific upcoming "
            "class from your calendar."
        )

    return (
        "Your next class appears to be:\n\n"
        f"• {format_schedule_event(event)}"
    )


def build_schedule_list_response(
    query,
    events,
):
    """
    Answer broad schedule questions deterministically.

    Supported examples:
    - What do I have today?
    - What do I have tomorrow?
    - Do I have anything tomorrow morning?
    - What's on my schedule this week?
    - Do I have any deadlines this week?
    - What do I have after 6 PM?
    """

    text = (
        query or ""
    ).strip().lower()

    now = datetime.now(
        LOCAL_TIMEZONE
    )

    today = now.date()

    # =====================================================
    # DEADLINES
    # =====================================================

    if (
        "deadline" in text
        or "deadlines" in text
    ):

        deadline_events = []

        week_end = (
            today
            + timedelta(days=7)
        )

        deadline_keywords = {
            "deadline",
            "due",
            "submission",
        }

        for event in events:

            event_date = get_event_date(
                event
            )

            if not event_date:
                continue

            if not (
                today
                <= event_date
                <= week_end
            ):
                continue

            content = " ".join([
                event.get("summary", ""),
                event.get("description", ""),
            ]).lower()

            if any(
                keyword in content
                for keyword in deadline_keywords
            ):

                deadline_events.append(
                    event
                )

        if not deadline_events:

            return (
                "I couldn't find any calendar events "
                "that are clearly marked as deadlines "
                "or submissions this week."
            )

        lines = [
            f"• {format_schedule_event(event)}"
            for event in deadline_events[:8]
        ]

        return (
            "Here are the deadlines I found "
            "this week:\n\n"
            + "\n".join(lines)
        )

    # =====================================================
    # NEXT CLASS
    # =====================================================

    if (
        "next class" in text
        or "upcoming class" in text
        or "next lecture" in text
    ):

        return build_next_class_response(
            events
        )

    # =====================================================
    # TOMORROW / TODAY
    # =====================================================

    target_date = today

    if "tomorrow" in text:

        target_date = (
            today
            + timedelta(days=1)
        )

    # =====================================================
    # SPECIFIC TIME WINDOW
    # =====================================================

    if (
        "after " in text
        or "before " in text
    ):

        target_time = extract_time_token(
            text
        )

        if target_time:

            if "after " in text:

                window_start = (
                    datetime.combine(
                        target_date,
                        target_time,
                        tzinfo=LOCAL_TIMEZONE,
                    )
                )

                window_end = datetime.combine(
                    target_date,
                    time(23, 59),
                    tzinfo=LOCAL_TIMEZONE,
                )

            else:

                window_start = datetime.combine(
                    target_date,
                    time(0, 0),
                    tzinfo=LOCAL_TIMEZONE,
                )

                window_end = datetime.combine(
                    target_date,
                    target_time,
                    tzinfo=LOCAL_TIMEZONE,
                )

            matching_events = (
                find_schedule_conflicts(
                    events,
                    window_start,
                    window_end,
                )
            )

            if not matching_events:

                return (
                    "I don't see any calendar events "
                    "in that time window."
                )

            lines = [
                f"• {format_schedule_event(event)}"
                for event in matching_events[:8]
            ]

            return (
                "Here's what I found:\n\n"
                + "\n".join(lines)
            )

    # =====================================================
    # MORNING / AFTERNOON / EVENING
    # =====================================================

    period_start = datetime.combine(
        target_date,
        time(0, 0),
        tzinfo=LOCAL_TIMEZONE,
    )

    period_end = datetime.combine(
        target_date,
        time(23, 59),
        tzinfo=LOCAL_TIMEZONE,
    )

    if "morning" in text:

        period_start = datetime.combine(
            target_date,
            time(5, 0),
            tzinfo=LOCAL_TIMEZONE,
        )

        period_end = datetime.combine(
            target_date,
            time(12, 0),
            tzinfo=LOCAL_TIMEZONE,
        )

    elif "afternoon" in text:

        period_start = datetime.combine(
            target_date,
            time(12, 0),
            tzinfo=LOCAL_TIMEZONE,
        )

        period_end = datetime.combine(
            target_date,
            time(17, 0),
            tzinfo=LOCAL_TIMEZONE,
        )

    elif "evening" in text:

        period_start = datetime.combine(
            target_date,
            time(17, 0),
            tzinfo=LOCAL_TIMEZONE,
        )

        period_end = datetime.combine(
            target_date,
            time(22, 0),
            tzinfo=LOCAL_TIMEZONE,
        )

    matching_events = (
        find_schedule_conflicts(
            events,
            period_start,
            period_end,
        )
    )

    if not matching_events:

        period_label = (
            "morning"
            if "morning" in text
            else "afternoon"
            if "afternoon" in text
            else "evening"
            if "evening" in text
            else "day"
        )

        if "tomorrow" in text:

            return (
                f"Your {period_label} tomorrow "
                "looks clear on the calendar."
            )

        return (
            f"Your {period_label} looks clear "
            "on the calendar."
        )

    lines = [
        f"• {format_schedule_event(event)}"
        for event in matching_events[:8]
    ]

    if "tomorrow" in text:

        return (
            "Here's your schedule for tomorrow"
            + (
                " morning"
                if "morning" in text
                else " afternoon"
                if "afternoon" in text
                else " evening"
                if "evening" in text
                else ""
            )
            + ":\n\n"
            + "\n".join(lines)
        )

    if (
        "today" in text
        or "what do i have" in text
        or "what's on" in text
        or "whats on" in text
    ):

        return (
            "Here's what you have today:\n\n"
            + "\n".join(lines)
        )

    return (
        "Here's what I found on your calendar:\n\n"
        + "\n".join(lines)
    )