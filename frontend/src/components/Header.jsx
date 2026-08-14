import { useEffect, useState } from "react";

import {
    Bell,
    Search,
    Sun,
    Moon,
    CalendarDays,
    ChevronDown,
    LogOut,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";


function Header({ search, setSearch }) {

    const navigate = useNavigate();


    // =========================
    // AUTHENTICATION
    // =========================

    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem("access")
    );

    const [username, setUsername] = useState(
        localStorage.getItem("username") || ""
    );

    const [profilePhoto, setProfilePhoto] = useState(
        ""
    );


    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });


    const firstLetter = username
        ? username.charAt(0).toUpperCase()
        : "S";


    // =========================
    // STATES
    // =========================

    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("theme") || "light";
    });


    const [showNotifications, setShowNotifications] = useState(false);

    const [showProfileMenu, setShowProfileMenu] = useState(false);


    // =========================
    // THEME
    // =========================

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

    useEffect(() => {

        if (!isLoggedIn) {
            setProfilePhoto("");
            return;
        }

        const loadProfilePhoto = async () => {

            try {

                const response = await fetch(
                    "http://127.0.0.1:8000/api/profile/",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${localStorage.getItem("access")}`,
                        },
                    }
                );

                if (!response.ok) return;

                const data = await response.json();

                setProfilePhoto(
                    data.photo || ""
                );

                if (data.username) {
                    setUsername(data.username);
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

        loadProfilePhoto();

    }, [isLoggedIn]);


    const toggleTheme = () => {

        setTheme((prev) =>
            prev === "light" ? "dark" : "light"
        );

    };


    // =========================
    // NOTIFICATION
    // =========================

    const handleNotificationClick = () => {

        setShowNotifications((prev) => !prev);

    };


    // =========================
    // LOGOUT
    // =========================

    const logout = () => {

        const confirmLogout = window.confirm(
            "Are you sure you want to logout?"
        );

        if (!confirmLogout) return;


        // Remove authentication data

        localStorage.removeItem("access");

        localStorage.removeItem("refresh");

        localStorage.removeItem("username");


        // Update state immediately

        setIsLoggedIn(false);

        setUsername("");

        setShowProfileMenu(false);


        // IMPORTANT:
        // Logout → Home page

        navigate("/");

    };


    return (

        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-3xl border-b border-slate-200 shadow-lg">

            <div className="max-w-7xl mx-auto px-10 py-5 flex justify-between items-center">


                {/* ========================= */}
                {/* LEFT SIDE */}
                {/* ========================= */}

                <div className="flex flex-col">

                    <h1 className="text-4xl font-black">

                        Dashboard

                    </h1>


                    <div className="flex items-center gap-2 mt-4 text-slate-500">

                        <CalendarDays size={16} />

                        <span className="text-sm">

                            {today}

                        </span>

                    </div>

                </div>


                {/* ========================= */}
                {/* RIGHT SIDE */}
                {/* ========================= */}

                <div className="flex items-center gap-4 relative">


                    {/* ========================= */}
                    {/* SEARCH */}
                    {/* ========================= */}

                    <div className="relative hidden xl:block">

                        <Search
                            size={18}
                            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                        />


                        <input
                            type="text"
                            value={search || ""}
                            onChange={(e) =>
                                setSearch?.(e.target.value)
                            }
                            placeholder="Search notes..."
                            className="w-[360px] h-[56px] rounded-2xl bg-slate-100 border border-transparent pl-14 pr-5 font-medium text-slate-700 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        />

                    </div>


                    {/* ========================= */}
                    {/* THEME */}
                    {/* ========================= */}

                    <button
                        onClick={toggleTheme}
                        className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 flex justify-center items-center transition"
                        title="Toggle theme"
                    >

                        {theme === "light"
                            ? <Moon size={20} />
                            : <Sun size={20} />
                        }

                    </button>


                    {/* ========================= */}
                    {/* NOTIFICATION */}
                    {/* ========================= */}

                    <div className="relative">

                        <button
                            onClick={handleNotificationClick}
                            className="relative w-14 h-14 rounded-2xl bg-slate-100 hover:bg-blue-50 flex items-center justify-center transition"
                            title="Notifications"
                        >

                            <Bell
                                size={24}
                                className="text-slate-700"
                            />

                            {isLoggedIn && (

                                <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white"></span>

                            )}

                        </button>


                        {showNotifications && (

                            <div className="absolute right-0 top-16 w-[320px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-50">

                                <div className="px-6 py-5 border-b border-slate-100">

                                    <h2 className="text-lg font-bold text-slate-800">

                                        Notifications

                                    </h2>

                                </div>


                                <div className="px-6 py-8 text-center text-slate-500">

                                    No new notifications.

                                </div>

                            </div>

                        )}

                    </div>


                    {/* ========================= */}
                    {/* LOGGED IN USER */}
                    {/* ========================= */}

                    {isLoggedIn && (

                        <>


                            {/* PROFILE MENU */}

                            <div className="relative">

                                <button
                                    onClick={() =>
                                        setShowProfileMenu(
                                            !showProfileMenu
                                        )
                                    }
                                    className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm hover:shadow-md hover:border-blue-300 transition"
                                >

                                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex justify-center items-center text-white font-bold text-lg overflow-hidden">

                                        {profilePhoto ? (

                                            <img
                                                src={
                                                    profilePhoto.startsWith("http")
                                                        ? profilePhoto
                                                        : `http://127.0.0.1:8000${profilePhoto}`
                                                }
                                                alt={username || "Profile"}
                                                className="w-full h-full object-cover"
                                            />

                                        ) : (

                                            firstLetter
                                            
                                        )}

                                    </div>


                                    <div className="leading-tight text-left">

                                        <p className="text-xs text-slate-500">

                                            Welcome

                                        </p>


                                        <h3 className="font-bold text-slate-800">

                                            {username}

                                        </h3>

                                    </div>


                                    <ChevronDown
                                        size={18}
                                        className="text-slate-500"
                                    />

                                </button>


                                {showProfileMenu && (

                                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">


                                        <button
                                            onClick={() => {
                                                setShowProfileMenu(false);
                                                navigate("/profile");
                                            }}
                                            className="w-full text-left px-5 py-4 hover:bg-slate-50 transition"
                                        >

                                            👤 My Profile

                                        </button>


                                        <button
                                            onClick={() => {
                                                setShowProfileMenu(false);
                                                navigate("/upload");
                                            }}
                                            className="w-full text-left px-5 py-4 hover:bg-slate-50 transition"
                                        >

                                            📤 Upload Note

                                        </button>


                                        <button
                                            onClick={() => {
                                                setShowProfileMenu(false);
                                                navigate("/create-blog");
                                            }}
                                            className="w-full text-left px-5 py-4 hover:bg-slate-50 transition"
                                        >

                                            📝 Create Blog

                                        </button>


                                        <button
                                            className="w-full text-left px-5 py-4 hover:bg-slate-50 transition"
                                        >

                                            ⚙ Settings

                                        </button>


                                        <hr />


                                        <button
                                            onClick={logout}
                                            className="w-full text-left px-5 py-4 text-red-600 hover:bg-red-50 transition"
                                        >

                                            🚪 Logout

                                        </button>

                                    </div>

                                )}

                            </div>


                            {/* LOGOUT BUTTON */}

                            <button
                                onClick={logout}
                                className="h-14 px-7 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-semibold transition shadow-lg hover:shadow-red-300 flex items-center justify-center gap-3"
                            >

                                <LogOut size={18} />

                                <span>
                                    Logout
                                </span>

                            </button>

                        </>

                    )}


                    {/* ========================= */}
                    {/* NEW VISITOR */}
                    {/* ========================= */}

                    {!isLoggedIn && (

                        <div className="relative">

                            <button
                                onClick={() =>
                                    setShowProfileMenu(!showProfileMenu)
                                }
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition"
                            >
                                Get Started

                                <ChevronDown
                                    size={18}
                                    className={`transition-transform ${
                                        showProfileMenu ? "rotate-180" : ""
                                    }`}
                                />

                            </button>

                            {showProfileMenu && (

                                <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">

                                    <Link
                                        to="/login"
                                        onClick={() => setShowProfileMenu(false)}
                                        className="block px-5 py-4 text-slate-700 font-semibold hover:bg-blue-50 hover:text-blue-600 transition"
                                    >
                                        Login
                                    </Link>

                                    <Link
                                        to="/register"
                                        onClick={() => setShowProfileMenu(false)}
                                        className="block px-5 py-4 text-slate-700 font-semibold hover:bg-blue-50 hover:text-blue-600 transition"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                </div>

            </div>

        </header>

    );

}


export default Header;