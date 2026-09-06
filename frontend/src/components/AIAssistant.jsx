import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";

import {
    Send,
    X,
    Bot,
    Loader2,
    Trash2,
    Sparkles,
    BookOpen,
    ArrowUpRight,
    MessageCircle,
    FileText,
    CalendarDays,
    Clock3,
    ExternalLink,
    CheckCircle2,
} from "lucide-react";

import API from "../services/api";

function AIAssistant() {
    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");

    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "Hi! I'm NoteShare AI. Ask me anything about the uploaded notes.",
        },
    ]);

    const [loading, setLoading] = useState(false);

    // =====================================================
    // GOOGLE CALENDAR STATE
    // =====================================================

    const [calendarConnected, setCalendarConnected] = useState(false);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [calendarLoading, setCalendarLoading] = useState(false);
    const [calendarConnecting, setCalendarConnecting] = useState(false);
    const [calendarError, setCalendarError] = useState("");

    // =====================================================
    // CLEAR CHAT
    // =====================================================

    const clearChat = () => {
        setMessages([
            {
                role: "assistant",
                content:
                    "Hi! I'm NoteShare AI. Ask me anything about the uploaded notes.",
            },
        ]);
    };

    // =====================================================
    // GOOGLE CALENDAR HELPERS
    // =====================================================

    const loadCalendar = async () => {
        setCalendarLoading(true);
        setCalendarError("");

        try {
            const statusResponse = await API.get(
                "google-calendar/status/"
            );

            const connected =
                statusResponse.data?.connected === true;

            setCalendarConnected(connected);

            if (!connected) {
                setCalendarEvents([]);
                return;
            }

            const eventsResponse = await API.get(
                "google-calendar/events/?days=7"
            );

            setCalendarEvents(
                Array.isArray(eventsResponse.data?.events)
                    ? eventsResponse.data.events
                    : []
            );
        } catch (error) {
            console.error(
                "Google Calendar Load Error:",
                error
            );

            setCalendarEvents([]);

            if (error.response?.status === 401) {
                setCalendarConnected(false);
                setCalendarError(
                    "Please log in to use your personal calendar."
                );
            } else {
                setCalendarError(
                    "Unable to load your calendar right now."
                );
            }
        } finally {
            setCalendarLoading(false);
        }
    };

    // =====================================================
    // LOAD CALENDAR WHEN ASSISTANT OPENS
    // =====================================================

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        loadCalendar();
    }, [isOpen]);

    // =====================================================
    // CONNECT GOOGLE CALENDAR
    // =====================================================

    const connectGoogleCalendar = async () => {
        if (calendarConnecting) {
            return;
        }

        setCalendarConnecting(true);
        setCalendarError("");

        try {
            const response = await API.get(
                "google-calendar/connect/"
            );

            const authorizationUrl =
                response.data?.authorization_url;

            if (!authorizationUrl) {
                throw new Error(
                    "Authorization URL was not returned."
                );
            }

            window.location.href = authorizationUrl;
        } catch (error) {
            console.error(
                "Google Calendar Connect Error:",
                error
            );

            if (error.response?.status === 401) {
                setCalendarError(
                    "Please log in to connect Google Calendar."
                );
            } else {
                setCalendarError(
                    error.response?.data?.error ||
                        "Could not connect Google Calendar."
                );
            }

            setCalendarConnecting(false);
        }
    };

    // =====================================================
    // FORMAT CALENDAR DATE / TIME
    // =====================================================

    const formatEventTime = (event) => {
        if (!event?.start) {
            return "";
        }

        if (event.is_all_day) {
            return "All day";
        }

        const date = new Date(event.start);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return new Intl.DateTimeFormat(
            undefined,
            {
                hour: "numeric",
                minute: "2-digit",
                month: "short",
                day: "numeric",
            }
        ).format(date);
    };

    const formatEventDay = (event) => {
        if (!event?.start) {
            return "";
        }

        const date = new Date(event.start);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return new Intl.DateTimeFormat(
            undefined,
            {
                weekday: "short",
            }
        ).format(date);
    };

    const isToday = (event) => {
        if (!event?.start || event.is_all_day) {
            const eventDate = event?.start;

            if (!eventDate) {
                return false;
            }

            const date = new Date(eventDate);

            if (Number.isNaN(date.getTime())) {
                return false;
            }

            const now = new Date();

            return (
                date.getFullYear() === now.getFullYear() &&
                date.getMonth() === now.getMonth() &&
                date.getDate() === now.getDate()
            );
        }

        const date = new Date(event.start);

        if (Number.isNaN(date.getTime())) {
            return false;
        }

        const now = new Date();

        return (
            date.getFullYear() === now.getFullYear() &&
            date.getMonth() === now.getMonth() &&
            date.getDate() === now.getDate()
        );
    };

    const todayEvents = calendarEvents.filter(
        (event) => isToday(event)
    );

    const upcomingEvents = calendarEvents.filter(
        (event) => !isToday(event)
    );

    // =====================================================
    // DAILY BRIEFING
    // =====================================================

    const getTimeOfDayGreeting = () => {
        const hour = new Date().getHours();

        if (hour < 12) {
            return "Good morning";
        }

        if (hour < 18) {
            return "Good afternoon";
        }

        return "Good evening";
    };

    const getNextTodayEvent = () => {
        const timedEvents = todayEvents
            .filter(
                (event) =>
                    event?.start &&
                    !event.is_all_day
            )
            .map((event) => ({
                ...event,
                parsedStart: new Date(
                    event.start
                ),
            }))
            .filter(
                (event) =>
                    !Number.isNaN(
                        event.parsedStart.getTime()
                    )
            )
            .sort(
                (a, b) =>
                    a.parsedStart.getTime() -
                    b.parsedStart.getTime()
            );

        const now = new Date();

        return (
            timedEvents.find(
                (event) =>
                    event.parsedStart >= now
            ) || timedEvents[0] || null
        );
    };

    const nextTodayEvent =
        getNextTodayEvent();

    const dailyGreeting =
        getTimeOfDayGreeting();

    // =====================================================
    // SEND MESSAGE
    // =====================================================

    const sendMessage = async () => {
        const trimmedMessage = message.trim();

        if (!trimmedMessage || loading) {
            return;
        }

        setMessages((previous) => [
            ...previous,
            {
                role: "user",
                content: trimmedMessage,
            },
        ]);

        setMessage("");
        setLoading(true);

        try {
            const response = await API.post("ai/chat/", {
                message: trimmedMessage,
            });

            setMessages((previous) => [
                ...previous,
                {
                    role: "assistant",
                    content: response.data.reply,
                    sources: response.data.sources || [],
                },
            ]);

            // Refresh agenda after an AI interaction
            // so the assistant stays current.
            if (calendarConnected) {
                loadCalendar();
            }
        } catch (error) {
            console.error("AI Assistant Error:", error);

            let errorMessage =
                "Sorry, I couldn't process your request.";

            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            }

            setMessages((previous) => [
                ...previous,
                {
                    role: "assistant",
                    content: errorMessage,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // KEYBOARD
    // =====================================================

    const handleKeyDown = (event) => {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();
            sendMessage();
        }
    };

    // =====================================================
    // SUGGESTED QUESTIONS
    // =====================================================

    const suggestedQuestions = [
        "Summarize my notes",
        "Explain this topic simply",
        "What are the key points?",
    ];

    const calendarQuestions = [
        "What do I have today?",
        "What's coming up this week?",
    ];

    return (
        <>
            {/* =====================================================
                FLOATING AI BUTTON
            ====================================================== */}

            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{
                            opacity: 0,
                            scale: 0.7,
                            y: 12,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.7,
                            y: 12,
                        }}
                        whileHover={{
                            scale: 1.06,
                            y: -2,
                        }}
                        whileTap={{
                            scale: 0.94,
                        }}
                        onClick={() => setIsOpen(true)}
                        className="
                            fixed
                            bottom-6
                            right-6
                            z-50
                            flex
                            h-16
                            w-16
                            items-center
                            justify-center
                            rounded-2xl
                            bg-gradient-to-br
                            from-blue-600
                            via-blue-500
                            to-cyan-400
                            text-white
                            shadow-[0_15px_35px_rgba(37,99,235,0.30)]
                            ring-1
                            ring-white/40
                        "
                        title="NoteShare AI Assistant"
                    >
                        <div className="absolute inset-0 rounded-2xl bg-white/10" />

                        <Bot
                            size={28}
                            strokeWidth={2.2}
                            className="relative z-10"
                        />

                        <span
                            className="
                                absolute
                                -right-1
                                -top-1
                                flex
                                h-5
                                w-5
                                items-center
                                justify-center
                                rounded-full
                                border-2
                                border-white
                                bg-emerald-400
                            "
                        >
                            <Sparkles
                                size={9}
                                className="text-white"
                            />
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* =====================================================
                CHAT WINDOW
            ====================================================== */}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 24,
                            scale: 0.97,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            y: 24,
                            scale: 0.97,
                        }}
                        transition={{
                            duration: 0.25,
                            ease: "easeOut",
                        }}
                        className="
                            ai-assistant-window

                            fixed
                            bottom-4
                            right-4
                            z-50
                            flex
                            h-[min(700px,calc(100vh-32px))]
                            w-[420px]
                            max-w-[calc(100vw-32px)]
                            flex-col
                            overflow-hidden
                            rounded-[28px]
                            border
                            border-slate-200/80
                            bg-white
                            shadow-[0_30px_90px_rgba(15,23,42,0.18)]

                            sm:bottom-6
                            sm:right-6
                        "
                    >
                        {/* =================================================
                            HEADER
                        ================================================== */}

                        <div
                            className="
                                ai-assistant-header

                                relative
                                overflow-hidden
                                bg-gradient-to-br
                                from-slate-950
                                via-blue-950
                                to-cyan-800
                                px-5
                                py-4
                                text-white
                            "
                        >
                            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-400/15 blur-3xl" />

                            <div className="relative flex items-center justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <motion.div
                                        animate={{
                                            y: [0, -2, 0],
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                        className="
                                            flex
                                            h-11
                                            w-11
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-2xl
                                            border
                                            border-white/10
                                            bg-white/10
                                            shadow-lg
                                            backdrop-blur-sm
                                        "
                                    >
                                        <Bot size={22} />
                                    </motion.div>

                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="truncate font-black">
                                                NoteShare AI
                                            </h3>

                                            <span
                                                className="
                                                    rounded-full
                                                    bg-emerald-400/15
                                                    px-2
                                                    py-0.5
                                                    text-[9px]
                                                    font-black
                                                    uppercase
                                                    tracking-wider
                                                    text-emerald-200
                                                "
                                            >
                                                Online
                                            </span>
                                        </div>

                                        <p className="mt-0.5 truncate text-[11px] text-blue-100">
                                            Your note-aware study assistant
                                        </p>
                                    </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-1">
                                    <button
                                        onClick={clearChat}
                                        className="
                                            ai-assistant-header-button
                                            rounded-xl
                                            p-2
                                            text-blue-100
                                            transition
                                            hover:bg-white/10
                                            hover:text-white
                                        "
                                        title="Clear chat"
                                    >
                                        <Trash2 size={17} />
                                    </button>

                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="
                                            ai-assistant-header-button
                                            rounded-xl
                                            p-2
                                            text-blue-100
                                            transition
                                            hover:bg-white/10
                                            hover:text-white
                                        "
                                        title="Close"
                                    >
                                        <X size={19} />
                                    </button>
                                </div>
                            </div>

                            <div
                                className="
                                    relative
                                    mt-4
                                    flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    border
                                    border-white/10
                                    bg-white/5
                                    px-3
                                    py-2
                                    text-[10px]
                                    font-semibold
                                    text-slate-300
                                    backdrop-blur-sm
                                "
                            >
                                <FileText
                                    size={13}
                                    className="text-cyan-300"
                                />

                                Answers are based on uploaded NoteShare content.
                            </div>
                        </div>

                        {/* =================================================
                            MESSAGES
                        ================================================== */}

                        <div
                            className="
                                ai-assistant-messages

                                flex-1
                                overflow-y-auto
                                bg-gradient-to-b
                                from-slate-50
                                to-white
                                px-4
                                py-5
                            "
                        >

                            {/* =================================================
                                DAILY BRIEFING
                            ================================================= */}

                            {calendarConnected && !calendarLoading && (
                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        y: 8,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    className="
                                        ai-assistant-daily-briefing
                                        mb-4
                                        overflow-hidden
                                        rounded-[22px]
                                        border
                                        border-blue-100
                                        bg-gradient-to-br
                                        from-slate-950
                                        via-blue-950
                                        to-cyan-900
                                        text-white
                                        shadow-lg
                                        shadow-blue-900/10
                                    "
                                >
                                    <div className="relative overflow-hidden px-4 py-4">
                                        <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-cyan-400/20 blur-3xl" />

                                        <div className="relative">
                                            <div className="mb-3 flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="
                                                            flex
                                                            h-8
                                                            w-8
                                                            items-center
                                                            justify-center
                                                            rounded-xl
                                                            bg-white/10
                                                            ring-1
                                                            ring-white/10
                                                        "
                                                    >
                                                        <Sparkles size={14} />
                                                    </div>

                                                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-cyan-200">
                                                        Daily Briefing
                                                    </p>
                                                </div>

                                                <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-emerald-200">
                                                    Live
                                                </span>
                                            </div>

                                            <h4 className="text-[18px] font-black tracking-tight">
                                                {dailyGreeting} 👋
                                            </h4>

                                            {todayEvents.length > 0 ? (
                                                <>
                                                    <p className="mt-1 text-[11px] font-medium leading-5 text-blue-100">
                                                        You have{" "}
                                                        <span className="font-black text-white">
                                                            {todayEvents.length}{" "}
                                                            {todayEvents.length === 1
                                                                ? "event"
                                                                : "events"}
                                                        </span>{" "}
                                                        scheduled for today.
                                                    </p>

                                                    {nextTodayEvent && (
                                                        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                                                            <p className="text-[8px] font-black uppercase tracking-[0.14em] text-cyan-200">
                                                                Next up
                                                            </p>

                                                            <div className="mt-2 flex items-start gap-3">
                                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                                                                    <Clock3 size={15} />
                                                                </div>

                                                                <div className="min-w-0">
                                                                    <p className="truncate text-[11px] font-black text-white">
                                                                        {nextTodayEvent.summary ||
                                                                            "Untitled event"}
                                                                    </p>

                                                                    <p className="mt-1 text-[9px] font-semibold text-blue-100">
                                                                        {formatEventTime(
                                                                            nextTodayEvent
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {todayEvents.length === 1 ? (
                                                        <p className="mt-3 text-[9px] font-semibold text-cyan-100/80">
                                                            Your schedule looks light today.
                                                        </p>
                                                    ) : (
                                                        <p className="mt-3 text-[9px] font-semibold text-cyan-100/80">
                                                            Your agenda is ready above. I’ll keep it
                                                            in context when you ask about your day.
                                                        </p>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <p className="mt-1 text-[11px] font-medium leading-5 text-blue-100">
                                                        Your calendar is clear today.
                                                    </p>

                                                    <div className="mt-4 rounded-2xl border border-emerald-300/10 bg-emerald-400/5 px-3 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle2
                                                                size={15}
                                                                className="text-emerald-300"
                                                            />

                                                            <p className="text-[10px] font-black text-emerald-100">
                                                                No events scheduled
                                                            </p>
                                                        </div>

                                                        <p className="mt-1 pl-5 text-[9px] font-semibold text-blue-100/70">
                                                            You have a clear day ahead.
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* =================================================
                                PERSONAL ASSISTANT / CALENDAR
                            ================================================== */}

                            <motion.div
                                initial={{
                                    opacity: 0,
                                    y: 8,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                className="
                                    ai-assistant-calendar-panel
                                    mb-5
                                    overflow-hidden
                                    rounded-2xl
                                    border
                                    border-blue-100
                                    bg-gradient-to-br
                                    from-blue-50
                                    via-white
                                    to-cyan-50
                                "
                            >
                                <div className="flex items-center justify-between gap-3 px-4 py-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div
                                            className="
                                                flex
                                                h-9
                                                w-9
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-xl
                                                bg-blue-600
                                                text-white
                                                shadow-sm
                                            "
                                        >
                                            <CalendarDays size={17} />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="ai-assistant-calendar-title text-[11px] font-black uppercase tracking-[0.12em] text-blue-700">
                                                Personal Assistant
                                            </p>

                                            <p className="ai-assistant-calendar-subtitle mt-0.5 text-[10px] font-semibold text-slate-500">
                                                Your schedule, right inside NoteShare
                                            </p>
                                        </div>
                                    </div>

                                    {calendarConnected && (
                                        <span
                                            className="
                                                flex
                                                shrink-0
                                                items-center
                                                gap-1
                                                rounded-full
                                                bg-emerald-100
                                                px-2
                                                py-1
                                                text-[9px]
                                                font-black
                                                text-emerald-700
                                            "
                                        >
                                            <CheckCircle2 size={10} />
                                            Connected
                                        </span>
                                    )}
                                </div>

                                {calendarError && (
                                    <div
                                        className="
                                            ai-assistant-calendar-error

                                            mx-4
                                            mb-3
                                            rounded-xl
                                            border
                                            border-amber-200
                                            bg-amber-50
                                            px-3
                                            py-2.5
                                            text-[10px]
                                            font-semibold
                                            leading-5
                                            text-amber-700
                                        "
                                    >
                                        {calendarError}
                                    </div>
                                )}

                                {!calendarConnected ? (
                                    <div className="px-4 pb-4">
                                        <p className="ai-assistant-calendar-description mb-3 text-[11px] leading-5 text-slate-600">
                                            Connect your Google Calendar so NoteShare AI can
                                            show today's agenda and upcoming events and answer
                                            schedule questions.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={
                                                connectGoogleCalendar
                                            }
                                            disabled={
                                                calendarConnecting
                                            }
                                            className="
                                                ai-assistant-calendar-connect

                                                flex
                                                w-full
                                                items-center
                                                justify-center
                                                gap-2
                                                rounded-xl
                                                bg-gradient-to-r
                                                from-blue-600
                                                to-cyan-500
                                                px-4
                                                py-2.5
                                                text-[11px]
                                                font-black
                                                text-white
                                                shadow-md
                                                shadow-blue-500/15
                                                transition
                                                hover:from-blue-700
                                                hover:to-cyan-600
                                                disabled:cursor-not-allowed
                                                disabled:opacity-60
                                            "
                                        >
                                            {calendarConnecting ? (
                                                <>
                                                    <Loader2
                                                        size={14}
                                                        className="animate-spin"
                                                    />
                                                    Connecting...
                                                </>
                                            ) : (
                                                <>
                                                    <CalendarDays size={14} />
                                                    Connect Google Calendar
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : calendarLoading ? (
                                    <div
                                        className="
                                            ai-assistant-calendar-loading

                                            flex
                                            items-center
                                            gap-2
                                            px-4
                                            pb-4
                                            text-[10px]
                                            font-semibold
                                            text-slate-500
                                        "
                                    >
                                        <Loader2
                                            size={14}
                                            className="animate-spin text-blue-500"
                                        />
                                        Syncing your schedule...
                                    </div>
                                ) : (
                                    <div className="px-4 pb-4">
                                        {/* TODAY */}

                                        <div className="mb-4">
                                            <div className="mb-2 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Clock3
                                                        size={13}
                                                        className="ai-assistant-calendar-icon text-blue-600"
                                                    />

                                                    <p className="ai-assistant-calendar-heading text-[10px] font-black uppercase tracking-wider text-slate-500">
                                                        Today's Agenda
                                                    </p>
                                                </div>

                                                <span className="ai-assistant-calendar-count text-[9px] font-bold text-slate-400">
                                                    {todayEvents.length}{" "}
                                                    {todayEvents.length ===
                                                    1
                                                        ? "item"
                                                        : "items"}
                                                </span>
                                            </div>

                                            {todayEvents.length ===
                                            0 ? (
                                                <div
                                                    className="
                                                        ai-assistant-empty-calendar

                                                        rounded-xl
                                                        border
                                                        border-dashed
                                                        border-blue-200
                                                        bg-white/70
                                                        px-3
                                                        py-3
                                                        text-[10px]
                                                        font-semibold
                                                        text-slate-500
                                                    "
                                                >
                                                    No calendar events today.
                                                    Your day is currently clear.
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {todayEvents
                                                        .slice(0, 4)
                                                        .map(
                                                            (
                                                                event
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        event.id
                                                                    }
                                                                    className="
                                                                        ai-assistant-calendar-event

                                                                        rounded-xl
                                                                        border
                                                                        border-blue-100
                                                                        bg-white
                                                                        px-3
                                                                        py-2.5
                                                                    "
                                                                >
                                                                    <div className="flex items-start gap-3">
                                                                        <div className="min-w-[55px] text-[9px] font-black text-blue-600">
                                                                            {event.is_all_day
                                                                                ? "ALL DAY"
                                                                                : formatEventTime(
                                                                                      event
                                                                                  )}
                                                                        </div>

                                                                        <div className="min-w-0 flex-1">
                                                                            <p className="ai-assistant-event-title break-words text-[11px] font-black text-slate-700">
                                                                                {event.summary ||
                                                                                    "Untitled event"}
                                                                            </p>

                                                                            {event.location && (
                                                                                <p className="ai-assistant-event-meta mt-1 truncate text-[9px] font-semibold text-slate-400">
                                                                                    {
                                                                                        event.location
                                                                                    }
                                                                                </p>
                                                                            )}
                                                                        </div>

                                                                        {event.html_link && (
                                                                            <a
                                                                                href={
                                                                                    event.html_link
                                                                                }
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                className="ai-assistant-calendar-link shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                                                                                title="Open in Google Calendar"
                                                                            >
                                                                                <ExternalLink
                                                                                    size={
                                                                                        12
                                                                                    }
                                                                                />
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                </div>
                                            )}
                                        </div>

                                        {/* UPCOMING */}

                                        {upcomingEvents.length >
                                            0 && (
                                            <div>
                                                <div className="mb-2 flex items-center gap-2">
                                                    <CalendarDays
                                                        size={13}
                                                        className="ai-assistant-calendar-icon text-cyan-600"
                                                    />

                                                    <p className="ai-assistant-calendar-heading text-[10px] font-black uppercase tracking-wider text-slate-500">
                                                        Upcoming
                                                    </p>
                                                </div>

                                                <div className="space-y-2">
                                                    {upcomingEvents
                                                        .slice(
                                                            0,
                                                            3
                                                        )
                                                        .map(
                                                            (
                                                                event
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        event.id
                                                                    }
                                                                    className="
                                                                        ai-assistant-calendar-event

                                                                        rounded-xl
                                                                        border
                                                                        border-slate-200
                                                                        bg-white
                                                                        px-3
                                                                        py-2.5
                                                                    "
                                                                >
                                                                    <div className="flex items-start gap-3">
                                                                        <div className="min-w-[48px]">
                                                                            <p className="ai-assistant-event-day text-[9px] font-black text-cyan-600">
                                                                                {formatEventDay(
                                                                                    event
                                                                                )}
                                                                            </p>

                                                                            <p className="ai-assistant-event-time mt-0.5 text-[9px] font-semibold text-slate-400">
                                                                                {event.is_all_day
                                                                                    ? "All day"
                                                                                    : formatEventTime(
                                                                                          event
                                                                                      )}
                                                                            </p>
                                                                        </div>

                                                                        <div className="min-w-0 flex-1">
                                                                            <p className="ai-assistant-event-title break-words text-[11px] font-black text-slate-700">
                                                                                {event.summary ||
                                                                                    "Untitled event"}
                                                                            </p>

                                                                            {event.location && (
                                                                                <p className="ai-assistant-event-meta mt-1 truncate text-[9px] font-semibold text-slate-400">
                                                                                    {
                                                                                        event.location
                                                                                    }
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                </div>
                                            </div>
                                        )}

                                        {/* CALENDAR QUESTIONS */}

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {calendarQuestions.map(
                                                (question) => (
                                                    <button
                                                        key={question}
                                                        type="button"
                                                        onClick={() =>
                                                            setMessage(
                                                                question
                                                            )
                                                        }
                                                        className="
                                                            ai-assistant-calendar-question

                                                            rounded-full
                                                            border
                                                            border-cyan-100
                                                            bg-cyan-50
                                                            px-3
                                                            py-2
                                                            text-left
                                                            text-[10px]
                                                            font-bold
                                                            text-cyan-700
                                                            transition
                                                            hover:border-cyan-200
                                                            hover:bg-cyan-100
                                                        "
                                                    >
                                                        {question}
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>

                            {/* Suggested prompts */}

                            {messages.length === 1 &&
                                !loading && (
                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                            y: 8,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                        }}
                                        className="mb-5"
                                    >
                                        <p
                                            className="
                                                ai-assistant-section-label

                                                mb-2
                                                text-[10px]
                                                font-black
                                                uppercase
                                                tracking-[0.15em]
                                                text-slate-400
                                            "
                                        >
                                            Try asking
                                        </p>

                                        <div className="flex flex-wrap gap-2">
                                            {suggestedQuestions.map(
                                                (
                                                    question
                                                ) => (
                                                    <button
                                                        key={
                                                            question
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            setMessage(
                                                                question
                                                            )
                                                        }
                                                        className="
                                                            ai-assistant-suggestion

                                                            rounded-full
                                                            border
                                                            border-blue-100
                                                            bg-blue-50
                                                            px-3
                                                            py-2
                                                            text-left
                                                            text-[11px]
                                                            font-bold
                                                            text-blue-600
                                                            transition
                                                            hover:border-blue-200
                                                            hover:bg-blue-100
                                                        "
                                                    >
                                                        {
                                                            question
                                                        }
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                            <div className="space-y-4">
                                {messages.map(
                                    (
                                        item,
                                        index
                                    ) => {
                                        const isUser =
                                            item.role ===
                                            "user";

                                        return (
                                            <motion.div
                                                key={`${item.role}-${index}`}
                                                initial={{
                                                    opacity: 0,
                                                    y: 10,
                                                    scale: 0.98,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                    scale: 1,
                                                }}
                                                transition={{
                                                    duration: 0.25,
                                                }}
                                                className={
                                                    isUser
                                                        ? "flex justify-end"
                                                        : "flex justify-start"
                                                }
                                            >
                                                {!isUser && (
                                                    <div
                                                        className="
                                                            mr-2
                                                            mt-1
                                                            flex
                                                            h-8
                                                            w-8
                                                            shrink-0
                                                            items-center
                                                            justify-center
                                                            rounded-xl
                                                            bg-gradient-to-br
                                                            from-blue-600
                                                            to-cyan-500
                                                            text-white
                                                            shadow-sm
                                                        "
                                                    >
                                                        <Bot
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    </div>
                                                )}

                                                <div
                                                    className={
                                                        isUser
                                                            ? `
                                                                ai-assistant-user-message

                                                                max-w-[82%]
                                                                rounded-2xl
                                                                rounded-br-md
                                                                bg-gradient-to-br
                                                                from-blue-600
                                                                to-blue-500
                                                                px-4
                                                                py-3
                                                                text-sm
                                                                leading-6
                                                                text-white
                                                                shadow-md
                                                                shadow-blue-500/10
                                                            `
                                                            : `
                                                                ai-assistant-ai-message

                                                                max-w-[84%]
                                                                rounded-2xl
                                                                rounded-bl-md
                                                                border
                                                                border-slate-200
                                                                bg-white
                                                                px-4
                                                                py-3
                                                                text-sm
                                                                leading-6
                                                                text-slate-700
                                                                shadow-sm
                                                            `
                                                    }
                                                >
                                                    <p className="whitespace-pre-wrap break-words">
                                                        {
                                                            item.content
                                                        }
                                                    </p>

                                                    {/* Sources */}

                                                    {item
                                                        .sources
                                                        ?.length >
                                                        0 && (
                                                        <div
                                                            className="
                                                                ai-assistant-sources

                                                                mt-3
                                                                border-t
                                                                border-slate-200
                                                                pt-3
                                                            "
                                                        >
                                                            <div
                                                                className="
                                                                    mb-2
                                                                    flex
                                                                    items-center
                                                                    gap-2
                                                                "
                                                            >
                                                                <BookOpen
                                                                    size={
                                                                        13
                                                                    }
                                                                    className="
                                                                        ai-assistant-source-icon
                                                                        text-blue-600
                                                                    "
                                                                />

                                                                <p
                                                                    className="
                                                                        ai-assistant-source-label

                                                                        text-[10px]
                                                                        font-black
                                                                        uppercase
                                                                        tracking-wider
                                                                        text-slate-400
                                                                    "
                                                                >
                                                                    Note Sources
                                                                </p>
                                                            </div>

                                                            <div className="space-y-1.5">
                                                                {item.sources.map(
                                                                    (
                                                                        source
                                                                    ) => (
                                                                        <button
                                                                            key={
                                                                                source.id
                                                                            }
                                                                            onClick={() =>
                                                                                navigate(
                                                                                    `/note/${source.id}`
                                                                                )
                                                                            }
                                                                            className="
                                                                                ai-assistant-source-card

                                                                                group
                                                                                flex
                                                                                w-full
                                                                                items-center
                                                                                justify-between
                                                                                gap-2
                                                                                rounded-xl
                                                                                border
                                                                                border-blue-100
                                                                                bg-blue-50
                                                                                px-3
                                                                                py-2.5
                                                                                text-left
                                                                                transition
                                                                                hover:border-blue-200
                                                                                hover:bg-blue-100
                                                                            "
                                                                        >
                                                                            <span
                                                                                className="
                                                                                    ai-assistant-source-title

                                                                                    line-clamp-2
                                                                                    min-w-0
                                                                                    text-[11px]
                                                                                    font-bold
                                                                                    text-blue-700
                                                                                "
                                                                            >
                                                                                {
                                                                                    source.title
                                                                                }
                                                                            </span>

                                                                            <ArrowUpRight
                                                                                size={
                                                                                    14
                                                                                }
                                                                                className="
                                                                                    ai-assistant-source-arrow

                                                                                    shrink-0
                                                                                    text-blue-400
                                                                                    transition
                                                                                    group-hover:translate-x-0.5
                                                                                    group-hover:-translate-y-0.5
                                                                                "
                                                                            />
                                                                        </button>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    }
                                )}

                                {/* AI loading */}

                                <AnimatePresence>
                                    {loading && (
                                        <motion.div
                                            initial={{
                                                opacity: 0,
                                                y: 8,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                y: 8,
                                            }}
                                            className="flex items-end gap-2"
                                        >
                                            <div
                                                className="
                                                    flex
                                                    h-8
                                                    w-8
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    bg-gradient-to-br
                                                    from-blue-600
                                                    to-cyan-500
                                                    text-white
                                                "
                                            >
                                                <Bot size={16} />
                                            </div>

                                            <div
                                                className="
                                                    ai-assistant-loading

                                                    flex
                                                    items-center
                                                    gap-1
                                                    rounded-2xl
                                                    rounded-bl-md
                                                    border
                                                    border-slate-200
                                                    bg-white
                                                    px-4
                                                    py-3
                                                    shadow-sm
                                                "
                                            >
                                                <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]" />
                                                <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.15s]" />
                                                <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* =================================================
                            INPUT
                        ================================================== */}

                        <div
                            className="
                                ai-assistant-footer

                                border-t
                                border-slate-200
                                bg-white
                                p-3
                            "
                        >
                            <div
                                className="
                                    ai-assistant-input-wrapper

                                    flex
                                    items-end
                                    gap-2
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    p-2
                                    transition

                                    focus-within:border-blue-300
                                    focus-within:bg-white
                                    focus-within:ring-4
                                    focus-within:ring-blue-100
                                "
                            >
                                <textarea
                                    value={message}
                                    onChange={(event) =>
                                        setMessage(
                                            event.target.value
                                        )
                                    }
                                    onKeyDown={
                                        handleKeyDown
                                    }
                                    placeholder="Ask about your notes or schedule..."
                                    rows={1}
                                    disabled={loading}
                                    className="
                                        ai-assistant-textarea

                                        max-h-24
                                        min-h-[40px]
                                        flex-1
                                        resize-none
                                        bg-transparent
                                        px-2
                                        py-2
                                        text-sm
                                        leading-6
                                        text-slate-700
                                        outline-none
                                        placeholder:text-slate-400
                                        disabled:cursor-not-allowed
                                        disabled:opacity-60
                                    "
                                />

                                <motion.button
                                    onClick={
                                        sendMessage
                                    }
                                    disabled={
                                        loading ||
                                        !message.trim()
                                    }
                                    whileHover={
                                        !loading &&
                                        message.trim()
                                            ? {
                                                  scale: 1.04,
                                              }
                                            : {}
                                    }
                                    whileTap={{
                                        scale: 0.95,
                                    }}
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-gradient-to-br
                                        from-blue-600
                                        to-cyan-500
                                        text-white
                                        shadow-md
                                        shadow-blue-500/15
                                        transition
                                        disabled:cursor-not-allowed
                                        disabled:opacity-40
                                    "
                                    title="Send message"
                                >
                                    {loading ? (
                                        <Loader2
                                            size={18}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <Send size={18} />
                                    )}
                                </motion.button>
                            </div>

                            <div
                                className="
                                    ai-assistant-footer-hint

                                    mt-2
                                    flex
                                    items-center
                                    justify-center
                                    gap-1.5
                                    text-[10px]
                                    font-semibold
                                    text-slate-400
                                "
                            >
                                <MessageCircle size={11} />
                                Enter to send · Shift + Enter for a new line
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default AIAssistant;