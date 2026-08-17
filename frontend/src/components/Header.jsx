import { useEffect, useState } from "react";
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
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import API from "../services/api";


function Header({ search, setSearch }) {

    const navigate = useNavigate();

    // ==========================================
    // AUTH
    // ==========================================

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

        localStorage.setItem("theme", theme);

        if (theme === "dark") {

            document.documentElement.classList.add("dark");

            document.body.style.background = "#0f172a";
            document.body.style.color = "#e2e8f0";

        } else {

            document.documentElement.classList.remove("dark");

            document.body.style.background = "#f8fafc";
            document.body.style.color = "#0f172a";

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
                        className="
                            mt-1
                            truncate
                            text-2xl
                            font-black
                            tracking-tight
                            text-slate-900
                            sm:text-3xl
                        "
                    >
                        Welcome back{username ? `, ${username}` : ""}
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

                    {/* Search */}

                    <div
                        className="
                            relative
                            hidden
                            xl:block
                        "
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
                            value={search || ""}
                            onChange={(event) =>
                                setSearch?.(
                                    event.target.value
                                )
                            }
                            placeholder="Search notes..."
                            className="
                                h-11
                                w-[280px]
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

                    <div className="relative">

                        <motion.button
                            whileHover={{
                                y: -2,
                            }}
                            whileTap={{
                                scale: 0.94,
                            }}
                            onClick={() =>
                                setShowNotifications(
                                    (previous) =>
                                        !previous
                                )
                            }
                            className="
                                relative
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
                            title="Notifications"
                        >

                            <Bell size={18} />

                            {isLoggedIn && (

                                <span
                                    className="
                                        absolute
                                        right-2
                                        top-2
                                        h-2
                                        w-2
                                        rounded-full
                                        bg-red-500
                                        ring-2
                                        ring-white
                                    "
                                />

                            )}

                        </motion.button>


                        <AnimatePresence>

                            {showNotifications && (

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
                                        shadow-2xl
                                    "
                                >

                                    <div
                                        className="
                                            border-b
                                            border-slate-100
                                            px-5
                                            py-4
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                items-center
                                                justify-between
                                            "
                                        >

                                            <h2
                                                className="
                                                    text-sm
                                                    font-extrabold
                                                    text-slate-800
                                                "
                                            >
                                                Notifications
                                            </h2>

                                            <span
                                                className="
                                                    rounded-full
                                                    bg-slate-100
                                                    px-2.5
                                                    py-1
                                                    text-[10px]
                                                    font-bold
                                                    uppercase
                                                    tracking-wider
                                                    text-slate-500
                                                "
                                            >
                                                0 new
                                            </span>

                                        </div>

                                    </div>

                                    <div
                                        className="
                                            px-5
                                            py-10
                                            text-center
                                        "
                                    >

                                        <Bell
                                            size={28}
                                            className="
                                                mx-auto
                                                text-slate-300
                                            "
                                        />

                                        <p
                                            className="
                                                mt-3
                                                text-sm
                                                font-semibold
                                                text-slate-600
                                            "
                                        >
                                            You're all caught up.
                                        </p>

                                        <p
                                            className="
                                                mt-1
                                                text-xs
                                                text-slate-400
                                            "
                                        >
                                            New activity will appear here.
                                        </p>

                                    </div>

                                </motion.div>

                            )}

                        </AnimatePresence>

                    </div>


                    {/* Profile / Get Started */}

                    {isLoggedIn ? (

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
                                            text-slate-400
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
                                                    mt-1
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