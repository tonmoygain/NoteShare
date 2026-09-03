import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    Bell,
    Search,
    Sun,
    Moon,
    CalendarDays,
    ChevronDown,
    LogOut,
    User,
    Upload,
    FilePenLine,
    Sparkles,
    FileText,
    BookOpen,
    CheckCircle2,
    CircleAlert,
    MessageSquare,
    Users,
    FileCheck2,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import API from "../services/api";


function Header({ search, setSearch }) {

    const navigate = useNavigate();

    // ==========================================
    // AUTH
    // ==========================================

    const [headerSearch, setHeaderSearch] = useState(
        search || ""
    );

    const [showSearchOptions, setShowSearchOptions] =
        useState(false);

    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem("access")
    );

    const [username, setUsername] = useState(
        localStorage.getItem("username") || ""
    );

    const [profilePhoto, setProfilePhoto] = useState("");

    // ==========================================
    // UI STATES
    // ==========================================

    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("theme") || "light";
    });

    const [showNotifications, setShowNotifications] =
        useState(false);

    const [showProfileMenu, setShowProfileMenu] =
        useState(false);

    const [notifications, setNotifications] = useState([]);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
    const [notificationLoading, setNotificationLoading] = useState(false);
    const [notificationError, setNotificationError] = useState("");

    const notificationRef = useRef(null);
    const profileRef = useRef(null);


    // ==========================================
    // HEADER SEARCH
    // ==========================================


    const submitSearch = (type = "notes") => {

        const query =
            headerSearch.trim();

        if (!query) {
            return;
        }

        setShowSearchOptions(false);

        if (setSearch) {
            setSearch(query);
        }

        navigate(
            `/${type}?search=${encodeURIComponent(query)}`
        );

    };


    const handleHeaderSearchChange = (
        event
    ) => {

        const value =
            event.target.value;

        setHeaderSearch(value);

        if (setSearch) {
            setSearch(value);
        }

        setShowSearchOptions(
            value.trim().length > 0
        );

    };


    const handleHeaderSearchKeyDown = (
        event
    ) => {

        if (event.key === "Enter") {

            event.preventDefault();

            submitSearch("notes");

        }

        if (event.key === "Escape") {

            setShowSearchOptions(false);

        }

    };

    // ==========================================
    // DATE
    // ==========================================

    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const firstLetter = username
        ? username.charAt(0).toUpperCase()
        : "S";

    // ==========================================
    // THEME
    // ==========================================

    useEffect(() => {

        const root =
            document.documentElement;

        localStorage.setItem("theme", theme);

        if (theme === "dark") {

            root.classList.add("dark");

        } else {

            root.classList.remove("dark");

        }

    }, [theme]);


    const toggleTheme = () => {

        setTheme((previous) =>
            previous === "light"
                ? "dark"
                : "light"
        );

    };


    // ==========================================
    // LOAD PROFILE
    // ==========================================

    useEffect(() => {

        if (!isLoggedIn) {

            setProfilePhoto("");

            return;
        }

        const loadProfile = async () => {

            try {

                const response =
                    await API.get("profile/");

                const data =
                    response.data;

                setProfilePhoto(
                    data.photo || ""
                );

                if (data.username) {

                    setUsername(
                        data.username
                    );

                    localStorage.setItem(
                        "username",
                        data.username
                    );

                }

            } catch (error) {

                console.error(
                    "Header Profile Error:",
                    error
                );

            }

        };

        loadProfile();

    }, [isLoggedIn]);


    // ==========================================
    // BACKEND NOTIFICATIONS
    // ==========================================

    const fetchNotifications = async (silent = false) => {
        if (!isLoggedIn) {
            setNotifications([]);
            setUnreadNotificationCount(0);
            return;
        }

        if (!silent) {
            setNotificationLoading(true);
        }

        try {
            const response = await API.get("notifications/?limit=20");
            const data = response?.data || {};
            setNotifications(
                Array.isArray(data.notifications)
                    ? data.notifications
                    : []
            );
            setUnreadNotificationCount(
                Number(data.unread_count) || 0
            );
            setNotificationError("");
        } catch (error) {
            console.error("Notification API Error:", error);
            if (!silent) {
                setNotificationError(
                    "Notifications are temporarily unavailable."
                );
            }
        } finally {
            if (!silent) {
                setNotificationLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchNotifications();

        if (!isLoggedIn) {
            return undefined;
        }

        const intervalId = window.setInterval(() => {
            fetchNotifications(true);
        }, 15000);

        const handleFocus = () => {
            fetchNotifications(true);
        };

        window.addEventListener("focus", handleFocus);

        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener("focus", handleFocus);
        };
    }, [isLoggedIn]);

    useEffect(() => {
        const handlePointerDown = (event) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target)
            ) {
                setShowNotifications(false);
            }

            if (
                profileRef.current &&
                !profileRef.current.contains(event.target)
            ) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
        };
    }, []);

    const markNotificationRead = async (notification) => {
        if (!notification?.id) return;

        try {
            if (!notification.is_read) {
                await API.post(
                    `notifications/${notification.id}/read/`
                );
            }

            setShowNotifications(false);
            await fetchNotifications(true);

            if (notification.link) {
                navigate(notification.link);
            }
        } catch (error) {
            console.error("Mark Notification Read Error:", error);
        }
    };

    const markAllNotificationsRead = async () => {
        if (!unreadNotificationCount) return;

        try {
            await API.post("notifications/read-all/");
            setNotifications((current) =>
                current.map((item) => ({ ...item, is_read: true }))
            );
            setUnreadNotificationCount(0);
        } catch (error) {
            console.error("Mark All Notifications Error:", error);
        }
    };

    const relativeTime = (value) => {
        const timestamp = new Date(value).getTime();
        if (!Number.isFinite(timestamp)) return "Recently";

        const seconds = Math.max(
            0,
            Math.floor((Date.now() - timestamp) / 1000)
        );

        if (seconds < 60) return "Just now";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;

        return new Date(value).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    const notificationPresentation = useMemo(() => {
        const map = {
            note_created: { icon: FileCheck2, tone: "blue", label: "Your note" },
            new_note: { icon: FileCheck2, tone: "blue", label: "New resource" },
            note_updated: { icon: FileCheck2, tone: "blue", label: "Note update" },
            note_deleted: { icon: CircleAlert, tone: "red", label: "Note activity" },
            blog_created: { icon: BookOpen, tone: "cyan", label: "Your blog" },
            new_blog: { icon: BookOpen, tone: "cyan", label: "New article" },
            blog_updated: { icon: BookOpen, tone: "cyan", label: "Blog update" },
            blog_deleted: { icon: CircleAlert, tone: "red", label: "Blog activity" },
            room_created: { icon: Users, tone: "violet", label: "Your room" },
            new_room: { icon: Users, tone: "violet", label: "New room" },
            room_joined: { icon: Users, tone: "emerald", label: "Room activity" },
            room_left: { icon: Users, tone: "amber", label: "Room activity" },
            room_message: { icon: MessageSquare, tone: "blue", label: "Discussion" },
            system: { icon: Bell, tone: "slate", label: "System" },
        };

        return notifications.map((item) => ({
            ...item,
            presentation: map[item.type] || map.system,
        }));
    }, [notifications]);

    // ==========================================
    // LOGOUT
    // ==========================================

    const logout = () => {

        const confirmed = window.confirm(
            "Are you sure you want to logout?"
        );

        if (!confirmed) {
            return;
        }

        localStorage.removeItem(
            "access"
        );

        localStorage.removeItem(
            "refresh"
        );

        localStorage.removeItem(
            "username"
        );

        setIsLoggedIn(false);
        setUsername("");
        setProfilePhoto("");
        setNotifications([]);
        setUnreadNotificationCount(0);
        setShowProfileMenu(false);
        setShowNotifications(false);

        navigate("/");

    };


    return (

        <header
            className="
                sticky
                top-0
                z-50
                border-b
                border-slate-200/70
                bg-white/75
                backdrop-blur-2xl
            "
        >

            <div
                className="
                    mx-auto
                    flex
                    min-h-[88px]
                    max-w-[1500px]
                    items-center
                    justify-between
                    gap-6
                    px-6
                    py-4
                    lg:px-8
                "
            >

                {/* ==========================================
                    PAGE CONTEXT
                ========================================== */}

                <motion.div
                    initial={{
                        opacity: 0,
                        x: -12,
                    }}
                    animate={{
                        opacity: 1,
                        x: 0,
                    }}
                    transition={{
                        duration: 0.45,
                    }}
                    className="min-w-0"
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                            text-[11px]
                            font-bold
                            uppercase
                            tracking-[0.18em]
                            text-blue-600
                        "
                    >

                        <Sparkles
                            size={13}
                            strokeWidth={2.4}
                        />

                        NoteShare
                    </div>

                    <h1
                        className={`
                            mt-1
                            truncate
                            text-2xl
                            font-black
                            tracking-tight
                            sm:text-3xl
                            ${theme === "dark" ? "text-white" : "text-slate-900"}
                        `}
                    >
                        Welcome{username ? `, ${username}` : ""}
                    </h1>

                    <div
                        className="
                            mt-1.5
                            hidden
                            items-center
                            gap-2
                            text-xs
                            font-medium
                            text-slate-400
                            sm:flex
                        "
                    >

                        <CalendarDays
                            size={14}
                        />

                        {today}

                    </div>

                </motion.div>


                {/* ==========================================
                    ACTIONS
                ========================================== */}

                <div
                    className="
                        relative
                        flex
                        items-center
                        gap-2
                        sm:gap-3
                    "
                >

                    {/* =====================================================
                        SEARCH
                    ====================================================== */}

                    <div className="relative hidden xl:block">

                        <form
                            onSubmit={(event) => {
                                event.preventDefault();

                                submitSearch("notes");
                            }}
                            className="relative"
                        >

                            <Search
                                size={17}
                                className="
                                    pointer-events-none
                                    absolute
                                    left-4
                                    top-1/2
                                    -translate-y-1/2
                                    text-slate-400
                                "
                            />

                            <input
                                type="text"
                                value={headerSearch}
                                onChange={
                                    handleHeaderSearchChange
                                }
                                onFocus={() => {

                                    if (
                                        headerSearch.trim()
                                    ) {
                                        setShowSearchOptions(
                                            true
                                        );
                                    }

                                }}
                                onKeyDown={
                                    handleHeaderSearchKeyDown
                                }
                                placeholder="Search notes or blogs..."
                                autoComplete="off"
                                className="
                                    h-11
                                    w-[300px]
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    pl-11
                                    pr-4
                                    text-sm
                                    font-medium
                                    text-slate-700
                                    outline-none
                                    transition-all
                                    duration-200
                                    placeholder:text-slate-400
                                    focus:border-blue-400
                                    focus:bg-white
                                    focus:ring-4
                                    focus:ring-blue-100/70
                                "
                            />

                        </form>


                        {/* =================================================
                            SEARCH OPTIONS
                        ================================================== */}

                        <AnimatePresence>

                            {showSearchOptions &&
                                headerSearch.trim() && (

                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                            y: -8,
                                            scale: 0.97,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            scale: 1,
                                        }}
                                        exit={{
                                            opacity: 0,
                                            y: -8,
                                            scale: 0.97,
                                        }}
                                        transition={{
                                            duration: 0.18,
                                        }}
                                        className="
                                            absolute
                                            right-0
                                            top-14
                                            z-50
                                            w-[300px]
                                            overflow-hidden
                                            rounded-2xl
                                            border
                                            border-slate-200
                                            bg-white
                                            p-1.5
                                            shadow-2xl
                                        "
                                    >

                                        <div className="px-3 py-2.5">

                                            <p className="
                                                text-[10px]
                                                font-black
                                                uppercase
                                                tracking-[0.16em]
                                                text-slate-400
                                            ">
                                                Search for
                                            </p>

                                        </div>


                                        {/* Search Notes */}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                submitSearch(
                                                    "notes"
                                                )
                                            }
                                            className="
                                                flex
                                                w-full
                                                items-center
                                                gap-3
                                                rounded-xl
                                                px-3
                                                py-3
                                                text-left
                                                transition
                                                hover:bg-blue-50
                                            "
                                        >

                                            <div className="
                                                flex
                                                h-9
                                                w-9
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-xl
                                                bg-blue-50
                                                text-blue-600
                                            ">
                                                <FileText
                                                    size={17}
                                                />
                                            </div>

                                        <div>

                                            <p className="
                                                text-sm
                                                font-bold
                                                text-slate-700
                                            ">
                                                Search Notes
                                            </p>

                                            <p className="
                                                mt-0.5
                                                text-[11px]
                                                text-slate-400
                                            ">
                                                Find study resources
                                           </p>

                                        </div>

                                    </button>


                                    {/* Search Blogs */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            submitSearch(
                                                "blogs"
                                            )
                                        }
                                        className="
                                            flex
                                            w-full
                                            items-center
                                            gap-3
                                            rounded-xl
                                            px-3
                                            py-3
                                            text-left
                                            transition
                                            hover:bg-cyan-50
                                        "
                                    >

                                        <div className="
                                            flex
                                            h-9
                                            w-9
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl
                                            bg-cyan-50
                                            text-cyan-600
                                        ">
                                            <BookOpen
                                                size={17}
                                            />
                                        </div>

                                        <div>

                                            <p className="
                                                text-sm
                                                font-bold
                                                text-slate-700
                                            ">
                                                Search Blogs
                                            </p>

                                            <p className="
                                                mt-0.5
                                                text-[11px]
                                                text-slate-400
                                            ">
                                                Find academic articles
                                            </p>

                                        </div>

                                    </button>


                                    {/* Hint */}

                                    <div className="
                                        border-t
                                        border-slate-100
                                        px-3
                                        py-2
                                    ">

                                    <p className="
                                        text-[10px]
                                        text-slate-400
                                    ">
                                        Press Enter to search Notes
                                    </p>

                                </div>

                            </motion.div>

                        )}

                    </AnimatePresence>

                </div>


                    {/* Theme */}

                    <motion.button
                        whileHover={{
                            y: -2,
                        }}
                        whileTap={{
                            scale: 0.94,
                        }}
                        onClick={toggleTheme}
                        className="
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            text-slate-600
                            shadow-sm
                            transition-colors
                            hover:border-blue-200
                            hover:bg-blue-50
                            hover:text-blue-600
                        "
                        title="Toggle theme"
                    >

                        <AnimatePresence
                            mode="wait"
                            initial={false}
                        >

                            {theme === "light" ? (

                                <motion.div
                                    key="moon"
                                    initial={{
                                        opacity: 0,
                                        rotate: -45,
                                        scale: 0.7,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        rotate: 0,
                                        scale: 1,
                                    }}
                                    exit={{
                                        opacity: 0,
                                        rotate: 45,
                                        scale: 0.7,
                                    }}
                                >
                                    <Moon size={18} />
                                </motion.div>

                            ) : (

                                <motion.div
                                    key="sun"
                                    initial={{
                                        opacity: 0,
                                        rotate: 45,
                                        scale: 0.7,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        rotate: 0,
                                        scale: 1,
                                    }}
                                    exit={{
                                        opacity: 0,
                                        rotate: -45,
                                        scale: 0.7,
                                    }}
                                >
                                    <Sun size={18} />
                                </motion.div>

                            )}

                        </AnimatePresence>

                    </motion.button>


                    {/* Notifications */}

                    <div
                        ref={notificationRef}
                        className="relative"
                    >

                        <motion.button
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => {
                                setShowNotifications((previous) => !previous);
                                setShowProfileMenu(false);
                                fetchNotifications(true);
                            }}
                            className={`
                                relative flex h-11 w-11 items-center justify-center
                                rounded-xl border shadow-sm transition-all duration-200
                                ${theme === "dark"
                                    ? showNotifications
                                        ? "border-blue-500/40 bg-blue-500/10 text-blue-300 hover:border-blue-500/60 hover:bg-blue-500/15"
                                        : "border-slate-700 bg-slate-900 text-slate-300 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-300"
                                    : showNotifications
                                        ? "border-blue-300 bg-blue-50 text-blue-600 hover:border-blue-400 hover:bg-blue-100"
                                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                }
                            `}
                            title="Notifications"
                            aria-label="Notifications"
                            aria-expanded={showNotifications}
                        >
                            <Bell size={18} />

                            {unreadNotificationCount > 0 && (
                                <span
                                    className={`absolute -right-1 -top-1 min-w-[19px] rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-1.5 py-0.5 text-center text-[9px] font-black leading-[14px] text-white shadow-lg shadow-blue-500/25 ring-2 ${theme === "dark" ? "ring-slate-950" : "ring-white"}`}
                                >
                                    {unreadNotificationCount > 9
                                        ? "9+"
                                        : unreadNotificationCount}
                                </span>
                            )}
                        </motion.button>

                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="fixed left-3 right-3 top-[80px] z-50 w-auto max-w-none overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] dark:border-slate-700 dark:bg-slate-900 sm:absolute sm:left-auto sm:right-0 sm:top-14 sm:w-[390px] sm:max-w-[calc(100vw-32px)]"
                                >
                                    <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 via-white to-cyan-50 px-5 py-4 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20">
                                                    <Bell size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 dark:text-white">
                                                        Notifications
                                                    </p>
                                                    <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                                        Important activity from NoteShare
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={markAllNotificationsRead}
                                                disabled={!unreadNotificationCount}
                                                className="rounded-lg px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-blue-600 transition hover:bg-blue-100 disabled:cursor-default disabled:opacity-40 dark:text-blue-300 dark:hover:bg-blue-500/10"
                                            >
                                                Mark all read
                                            </button>
                                        </div>
                                    </div>

                                    <div className="max-h-[calc(100vh-180px)] overflow-y-auto p-2">
                                        {notificationLoading && notifications.length === 0 ? (
                                            <div className="px-5 py-12 text-center">
                                                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-blue-100 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400" />
                                                <p className="mt-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                                                    Loading notifications...
                                                </p>
                                            </div>
                                        ) : notificationError && notifications.length === 0 ? (
                                            <div className="px-5 py-12 text-center">
                                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400">
                                                    <CircleAlert size={20} />
                                                </div>
                                                <p className="mt-4 text-sm font-bold text-slate-700 dark:text-slate-200">
                                                    Notifications unavailable
                                                </p>
                                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                                    The server could not be reached right now.
                                                </p>
                                            </div>
                                        ) : notificationPresentation.length === 0 ? (
                                            <div className="px-5 py-14 text-center">
                                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                                                    <Bell size={23} />
                                                </div>
                                                <p className="mt-4 text-sm font-black text-slate-700 dark:text-slate-200">
                                                    You're all caught up
                                                </p>
                                                <p className="mx-auto mt-1 max-w-[230px] text-xs leading-5 text-slate-400">
                                                    Important NoteShare activity will appear here automatically.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                {notificationPresentation.map((item) => {
                                                    const Icon = item.presentation.icon;
                                                    const toneClasses = {
                                                        blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300",
                                                        cyan: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300",
                                                        violet: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300",
                                                        emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
                                                        amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
                                                        red: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300",
                                                        slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                                                    };

                                                    return (
                                                        <motion.button
                                                            key={item.id}
                                                            type="button"
                                                            whileHover={{ y: -1 }}
                                                            onClick={() => markNotificationRead(item)}
                                                            className={`group flex w-full items-start gap-3 rounded-2xl p-3 text-left transition-all ${
                                                                item.is_read
                                                                    ? "hover:bg-slate-50 dark:hover:bg-slate-800/70"
                                                                    : "bg-blue-50/70 hover:bg-blue-50 dark:bg-blue-500/5 dark:hover:bg-blue-500/10"
                                                            }`}
                                                        >
                                                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClasses[item.presentation.tone] || toneClasses.slate}`}>
                                                                <Icon size={17} />
                                                            </div>

                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <p className="text-xs font-black text-slate-800 dark:text-slate-100">
                                                                        {item.title}
                                                                    </p>
                                                                    {!item.is_read && (
                                                                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                                                                    )}
                                                                </div>

                                                                <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-5 text-slate-500 dark:text-slate-400">
                                                                    {item.message}
                                                                </p>

                                                                <div className="mt-2 flex items-center gap-2">
                                                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                                        {item.presentation.label}
                                                                    </span>
                                                                    <span className="text-[10px] font-semibold text-slate-400">
                                                                        {relativeTime(item.created_at)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </motion.button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t border-slate-100 px-5 py-3 dark:border-slate-800">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-[10px] font-bold text-slate-400">
                                                Stored securely in your NoteShare account
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowNotifications(false);
                                                    navigate("/learning-intelligence");
                                                }}
                                                className="text-[10px] font-black uppercase tracking-wider text-blue-600 hover:text-blue-700 dark:text-blue-300"
                                            >
                                                Learning Intelligence
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>


                    {/* Profile / Get Started */}

                    {isLoggedIn ? (

                        <div ref={profileRef} className="relative">

                            <motion.button
                                whileHover={{
                                    y: -2,
                                }}
                                whileTap={{
                                    scale: 0.98,
                                }}
                                onClick={() =>
                                    setShowProfileMenu(
                                        (previous) =>
                                            !previous
                                    )
                                }
                                className="
                                    flex
                                    items-center
                                    gap-3
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-white
                                    px-2.5
                                    py-2
                                    shadow-sm
                                    transition-all
                                    duration-200
                                    hover:border-blue-200
                                    hover:shadow-md
                                    dark:hover:border-blue-500/40
                                "
                            >

                                <div
                                    className="
                                        flex
                                        h-9
                                        w-9
                                        shrink-0
                                        items-center
                                        justify-center
                                        overflow-hidden
                                        rounded-full
                                        bg-gradient-to-br
                                        from-blue-600
                                        to-cyan-400
                                        text-sm
                                        font-extrabold
                                        text-white
                                    "
                                >

                                    {profilePhoto ? (

                                        <img
                                            src={profilePhoto}
                                            alt={
                                                username ||
                                                "Profile"
                                            }
                                            className="
                                                h-full
                                                w-full
                                                object-cover
                                            "
                                        />

                                    ) : (

                                        firstLetter

                                    )}

                                </div>

                                <div
                                    className="
                                        hidden
                                        text-left
                                        sm:block
                                    "
                                >

                                    <p
                                        className="
                                            text-[10px]
                                            font-bold
                                            uppercase
                                            tracking-wider
                                            text-slate-500
                                            dark:text-slate-400
                                        "
                                    >
                                        Signed in
                                    </p>

                                    <p
                                        className="
                                            max-w-[110px]
                                            truncate
                                            text-sm
                                            font-bold
                                            text-slate-800
                                        "
                                    >
                                        {username}
                                    </p>

                                </div>

                                <ChevronDown
                                    size={16}
                                    className={`
                                        text-slate-400
                                        transition-transform
                                        duration-200
                                        ${
                                            showProfileMenu
                                                ? "rotate-180"
                                                : ""
                                        }
                                    `}
                                />

                            </motion.button>


                            <AnimatePresence>

                                {showProfileMenu && (

                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                            y: -8,
                                            scale: 0.97,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            scale: 1,
                                        }}
                                        exit={{
                                            opacity: 0,
                                            y: -8,
                                            scale: 0.97,
                                        }}
                                        transition={{
                                            duration: 0.18,
                                        }}
                                        className="
                                            absolute
                                            right-0
                                            top-14
                                            z-50
                                            w-64
                                            overflow-hidden
                                            rounded-2xl
                                            border
                                            border-slate-200
                                            bg-white
                                            p-1.5
                                            shadow-2xl
                                        "
                                    >

                                        <div
                                            className="
                                                mb-1
                                                rounded-xl
                                                bg-slate-50
                                                px-3
                                                py-3
                                            "
                                        >

                                            <p
                                                className="
                                                    text-[10px]
                                                    font-bold
                                                    uppercase
                                                    tracking-wider
                                                    text-slate-400
                                                "
                                            >
                                                Account
                                            </p>

                                            <p
                                                className="
                                                    max-w-[110px]
                                                    truncate
                                                    text-sm
                                                    font-bold
                                                    text-slate-800
                                                "
                                            >
                                                {username}
                                            </p>

                                        </div>

                                        <Link
                                            to="/profile"
                                            onClick={() =>
                                                setShowProfileMenu(
                                                    false
                                                )
                                            }
                                            className="
                                                flex
                                                items-center
                                                gap-3
                                                rounded-xl
                                                px-3
                                                py-2.5
                                                text-sm
                                                font-semibold
                                                text-slate-700
                                                transition-colors
                                                hover:bg-blue-50
                                                hover:text-blue-600
                                            "
                                        >
                                            <User size={17} />
                                            My Profile
                                        </Link>

                                        <Link
                                            to="/upload"
                                            onClick={() =>
                                                setShowProfileMenu(
                                                    false
                                                )
                                            }
                                            className="
                                                flex
                                                items-center
                                                gap-3
                                                rounded-xl
                                                px-3
                                                py-2.5
                                                text-sm
                                                font-semibold
                                                text-slate-700
                                                transition-colors
                                                hover:bg-blue-50
                                                hover:text-blue-600
                                            "
                                        >
                                            <Upload size={17} />
                                            Upload Note
                                        </Link>

                                        <Link
                                            to="/create-blog"
                                            onClick={() =>
                                                setShowProfileMenu(
                                                    false
                                                )
                                            }
                                            className="
                                                flex
                                                items-center
                                                gap-3
                                                rounded-xl
                                                px-3
                                                py-2.5
                                                text-sm
                                                font-semibold
                                                text-slate-700
                                                transition-colors
                                                hover:bg-blue-50
                                                hover:text-blue-600
                                            "
                                        >
                                            <FilePenLine
                                                size={17}
                                            />
                                            Create Blog
                                        </Link>

                                        <div
                                            className="
                                                my-1.5
                                                h-px
                                                bg-slate-100
                                            "
                                        />

                                        <button
                                            onClick={logout}
                                            className="
                                                flex
                                                w-full
                                                items-center
                                                gap-3
                                                rounded-xl
                                                px-3
                                                py-2.5
                                                text-left
                                                text-sm
                                                font-semibold
                                                text-red-600
                                                transition-colors
                                                hover:bg-red-50
                                            "
                                        >
                                            <LogOut size={17} />
                                            Logout
                                        </button>

                                    </motion.div>

                                )}

                            </AnimatePresence>

                        </div>

                    ) : (

                        <div className="relative">

                            <motion.button
                                whileHover={{
                                    y: -2,
                                }}
                                whileTap={{
                                    scale: 0.98,
                                }}
                                onClick={() =>
                                    setShowProfileMenu(
                                        (previous) =>
                                            !previous
                                    )
                                }
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    bg-gradient-to-r
                                    from-blue-600
                                    to-blue-500
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-bold
                                    text-white
                                    shadow-lg
                                    shadow-blue-500/20
                                    transition-all
                                    duration-200
                                    hover:shadow-xl
                                    hover:shadow-blue-500/25
                                "
                            >
                                Get Started

                                <ChevronDown
                                    size={16}
                                    className={`
                                        transition-transform
                                        duration-200
                                        ${
                                            showProfileMenu
                                                ? "rotate-180"
                                                : ""
                                        }
                                    `}
                                />

                            </motion.button>

                            <AnimatePresence>

                                {showProfileMenu && (

                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                            y: -8,
                                            scale: 0.97,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            scale: 1,
                                        }}
                                        exit={{
                                            opacity: 0,
                                            y: -8,
                                            scale: 0.97,
                                        }}
                                        className="
                                            absolute
                                            right-0
                                            top-14
                                            z-50
                                            w-52
                                            overflow-hidden
                                            rounded-2xl
                                            border
                                            border-slate-200
                                            bg-white
                                            p-1.5
                                            shadow-2xl
                                        "
                                    >

                                        <Link
                                            to="/login"
                                            onClick={() =>
                                                setShowProfileMenu(
                                                    false
                                                )
                                            }
                                            className="
                                                block
                                                rounded-xl
                                                px-4
                                                py-3
                                                text-sm
                                                font-semibold
                                                text-slate-700
                                                transition-colors
                                                hover:bg-blue-50
                                                hover:text-blue-600
                                            "
                                        >
                                            Sign in
                                        </Link>

                                        <Link
                                            to="/register"
                                            onClick={() =>
                                                setShowProfileMenu(
                                                    false
                                                )
                                            }
                                            className="
                                                block
                                                rounded-xl
                                                px-4
                                                py-3
                                                text-sm
                                                font-semibold
                                                text-slate-700
                                                transition-colors
                                                hover:bg-blue-50
                                                hover:text-blue-600
                                            "
                                        >
                                            Create account
                                        </Link>

                                    </motion.div>

                                )}

                            </AnimatePresence>

                        </div>

                    )}

                </div>

            </div>

        </header>

    );

}

export default Header;