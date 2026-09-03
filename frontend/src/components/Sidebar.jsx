import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    Link,
    useLocation,
} from "react-router-dom";

import {
    Home,
    BookOpen,
    MessageSquare,
    GraduationCap,
    FileText,
    ChevronRight,
    Menu,
    X,
    BrainCircuit,
} from "lucide-react";

function Sidebar() {
    const location = useLocation();

    const [mobileOpen, setMobileOpen] =
        useState(false);

    const username =
        localStorage.getItem("username") ||
        "Student";

    const firstLetter =
        username.charAt(0).toUpperCase();

    /* =========================================================
       MAIN NAVIGATION
    ========================================================= */

    const menus = [
        {
            title: "Home",
            icon: Home,
            path: "/",
        },
        {
            title: "Notes",
            icon: BookOpen,
            path: "/notes",
        },
        {
            title: "Blogs",
            icon: FileText,
            path: "/blogs",
        },
        {
            title: "Discussion",
            icon: MessageSquare,
            path: "/rooms",
        },
        {
            title: "AI Tutor",
            icon: BrainCircuit,
            path: "/ai-tutor",
        },
        {
            title: "Learning Intelligence",
            icon: BrainCircuit,
            path: "/learning-intelligence",
        },
    ];

    /* =========================================================
       ACTIVE STATE
    ========================================================= */

    const isActive = (path) => {
        if (path === "/") {
            return location.pathname === "/";
        }

        return (
            location.pathname === path ||
            location.pathname.startsWith(
                `${path}/`
            )
        );
    };

    /* =========================================================
       MOBILE
    ========================================================= */

    const closeMobileMenu = () => {
        setMobileOpen(false);
    };

    return (
        <>
            {/* =====================================================
                MOBILE MENU BUTTON
            ====================================================== */}

            <motion.button
                type="button"
                initial={{
                    opacity: 0,
                    scale: 0.9,
                }}
                animate={{
                    opacity: 1,
                    scale: 1,
                }}
                whileHover={{
                    y: -2,
                }}
                whileTap={{
                    scale: 0.95,
                }}
                onClick={() =>
                    setMobileOpen(true)
                }
                className="
                    fixed
                    bottom-6
                    left-4
                    z-[70]
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-white/70
                    bg-white/95
                    text-slate-700
                    shadow-[0_12px_30px_rgba(15,23,42,0.14)]
                    backdrop-blur-xl
                    transition
                    hover:text-blue-600
                    lg:hidden
                "
                aria-label="Open navigation menu"
            >
                <Menu size={21} />
            </motion.button>

            {/* =====================================================
                MOBILE OVERLAY
            ====================================================== */}

            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: 1,
                        }}
                        exit={{
                            opacity: 0,
                        }}
                        onClick={
                            closeMobileMenu
                        }
                        className="
                            fixed
                            inset-0
                            z-[60]
                            bg-slate-950/40
                            backdrop-blur-sm
                            lg:hidden
                        "
                    />
                )}
            </AnimatePresence>

            {/* =====================================================
                SIDEBAR
            ====================================================== */}

            <aside
                className="
                    fixed
                    inset-y-0
                    left-0
                    z-[65]
                    flex
                    w-72
                    flex-col
                    border-r
                    border-slate-200/80
                    bg-white/95
                    shadow-[10px_0_40px_rgba(15,23,42,0.06)]
                    backdrop-blur-xl
                    transition-transform
                    duration-300
                    lg:translate-x-0
                "
                style={{
                    transform:
                        mobileOpen
                            ? "translateX(0)"
                            : undefined,
                }}
            >
                {/* =================================================
                    BRAND
                ================================================== */}

                <div className="
                    px-4
                    pt-5
                ">
                    <div className="
                        flex
                        items-center
                        justify-between
                        gap-3
                    ">

                        <Link
                            to="/"
                            onClick={
                                closeMobileMenu
                            }
                            className="
                                group
                                flex
                                min-w-0
                                items-center
                                gap-3
                            "
                        >
                            <div className="
                                flex
                                h-11
                                w-11
                                shrink-0
                                items-center
                                justify-center
                                rounded-2xl
                                bg-gradient-to-br
                                from-blue-600
                                via-blue-500
                                to-cyan-400
                                text-white
                                shadow-lg
                                shadow-blue-500/20
                                transition
                                group-hover:scale-105
                            ">
                                <GraduationCap
                                    size={23}
                                    strokeWidth={2.2}
                                />
                            </div>

                            <div className="
                                min-w-0
                            ">
                                <p className="
                                    truncate
                                    text-lg
                                    font-black
                                    tracking-tight
                                    text-slate-900
                                ">
                                    NoteShare
                                </p>

                                <p className="
                                    truncate
                                    text-[9px]
                                    font-black
                                    uppercase
                                    tracking-[0.18em]
                                    text-slate-400
                                ">
                                    Learn · Share · Grow
                                </p>
                            </div>
                        </Link>

                        <button
                            type="button"
                            onClick={
                                closeMobileMenu
                            }
                            className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-slate-100
                                text-slate-500
                                transition
                                hover:bg-slate-200
                                hover:text-slate-800
                                lg:hidden
                            "
                            aria-label="Close navigation menu"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* =================================================
                    NAVIGATION
                ================================================== */}

                <div className="
                    relative
                    flex-1
                    overflow-y-auto
                    px-4
                    pt-8
                ">
                    <p className="
                        mb-3
                        px-3
                        text-[10px]
                        font-extrabold
                        uppercase
                        tracking-[0.2em]
                        text-slate-400
                    ">
                        Navigation
                    </p>

                    <nav className="
                        space-y-1.5
                    ">
                        {menus.map(
                            (
                                menu,
                                index
                            ) => {
                                const active =
                                    isActive(
                                        menu.path
                                    );

                                const Icon =
                                    menu.icon;

                                return (
                                    <motion.div
                                        key={
                                            menu.title
                                        }
                                        initial={{
                                            opacity: 0,
                                            x: -10,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            x: 0,
                                        }}
                                        transition={{
                                            duration: 0.35,
                                            delay:
                                                index *
                                                0.05,
                                            ease: "easeOut",
                                        }}
                                    >
                                        <Link
                                            to={
                                                menu.path
                                            }
                                            onClick={
                                                closeMobileMenu
                                            }
                                            className={`
                                                group
                                                relative
                                                flex
                                                items-center
                                                gap-3
                                                overflow-hidden
                                                rounded-2xl
                                                px-3
                                                py-2.5
                                                text-sm
                                                font-semibold
                                                transition-all
                                                duration-300
                                                ${
                                                    active
                                                        ? "text-blue-700"
                                                        : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                                                }
                                            `}
                                        >
                                            {active && (
                                                <motion.div
                                                    layoutId="sidebar-active-bg"
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 380,
                                                        damping: 30,
                                                    }}
                                                    className="
                                                        absolute
                                                        inset-0
                                                        rounded-2xl
                                                        bg-gradient-to-r
                                                        from-blue-50
                                                        via-blue-50/80
                                                        to-cyan-50/70
                                                    "
                                                />
                                            )}

                                            {!active && (
                                                <span className="
                                                    pointer-events-none
                                                    absolute
                                                    inset-y-0
                                                    left-0
                                                    w-1/3
                                                    -translate-x-full
                                                    bg-gradient-to-r
                                                    from-transparent
                                                    via-white/70
                                                    to-transparent
                                                    transition-transform
                                                    duration-700
                                                    group-hover:translate-x-[400%]
                                                " />
                                            )}

                                            <motion.span
                                                whileHover={{
                                                    scale: 1.06,
                                                }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 400,
                                                    damping: 20,
                                                }}
                                                className={`
                                                    relative
                                                    z-10
                                                    flex
                                                    h-10
                                                    w-10
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    transition-all
                                                    duration-300
                                                    ${
                                                        active
                                                            ? "bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20"
                                                            : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-sm"
                                                    }
                                                `}
                                            >
                                                <Icon
                                                    size={
                                                        19
                                                    }
                                                    strokeWidth={
                                                        2.2
                                                    }
                                                />
                                            </motion.span>

                                            <span className="
                                                relative
                                                z-10
                                                flex-1
                                            ">
                                                {
                                                    menu.title
                                                }
                                            </span>

                                            <motion.span
                                                animate={{
                                                    x: active
                                                        ? 0
                                                        : -3,
                                                    opacity:
                                                        active
                                                            ? 1
                                                            : 0,
                                                }}
                                                transition={{
                                                    duration: 0.2,
                                                }}
                                                className="
                                                    relative
                                                    z-10
                                                    text-blue-500
                                                "
                                            >
                                                <ChevronRight
                                                    size={
                                                        16
                                                    }
                                                    strokeWidth={
                                                        2.3
                                                    }
                                                />
                                            </motion.span>

                                            {active && (
                                                <motion.span
                                                    layoutId="sidebar-active-indicator"
                                                    className="
                                                        absolute
                                                        right-1.5
                                                        top-1/2
                                                        h-6
                                                        w-1
                                                        -translate-y-1/2
                                                        rounded-full
                                                        bg-gradient-to-b
                                                        from-blue-500
                                                        to-cyan-400
                                                    "
                                                />
                                            )}
                                        </Link>
                                    </motion.div>
                                );
                            }
                        )}
                    </nav>
                </div>

                {/* =================================================
                    USER
                ================================================== */}

                <div className="
                    relative
                    px-4
                    pb-5
                    pt-3
                ">
                    <div className="
                        mb-3
                        h-px
                        bg-gradient-to-r
                        from-transparent
                        via-slate-200
                        to-transparent
                    " />

                    <motion.div
                        whileHover={{
                            y: -2,
                        }}
                        transition={{
                            duration: 0.2,
                        }}
                        className="
                            group
                            relative
                            overflow-hidden
                            rounded-2xl
                            border
                            border-slate-200/80
                            bg-gradient-to-br
                            from-slate-50
                            to-white
                            p-3
                            shadow-sm
                        "
                    >
                        <div className="
                            pointer-events-none
                            absolute
                            -right-8
                            -top-8
                            h-20
                            w-20
                            rounded-full
                            bg-blue-100/50
                            blur-2xl
                        " />

                        <div className="
                            relative
                            flex
                            items-center
                            gap-3
                        ">
                            <div
                                className="
                                    relative
                                    flex
                                    h-10
                                    w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-gradient-to-br
                                    from-blue-600
                                    via-blue-500
                                    to-cyan-400
                                    text-sm
                                    font-extrabold
                                    text-white
                                    shadow-md
                                    shadow-blue-500/20
                                "
                            >
                                {firstLetter}

                                <span
                                    className="
                                        absolute
                                        bottom-0
                                        right-0
                                        h-2.5
                                        w-2.5
                                        rounded-full
                                        border-2
                                        border-white
                                        bg-emerald-400
                                    "
                                />
                            </div>

                            <div className="
                                min-w-0
                                flex-1
                            ">
                                <p
                                    className="
                                        truncate
                                        text-sm
                                        font-bold
                                        text-slate-800
                                    "
                                >
                                    {username}
                                </p>

                                <p
                                    className="
                                        mt-0.5
                                        text-xs
                                        font-medium
                                        text-slate-400
                                    "
                                >
                                    NoteShare member
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;