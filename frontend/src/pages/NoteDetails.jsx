import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useParams, useNavigate } from "react-router-dom";

import {
    Download,
    Pencil,
    Trash2,
    CalendarDays,
    User,
    Eye,
    ArrowLeft,
    FileText,
    Loader2,
    BookOpen,
    Sparkles,
    ShieldCheck,
    ArrowUpRight,
    GraduationCap,
    School,
    Layers3,
} from "lucide-react";

import API from "../services/api";
import Toast from "../components/Toast";

function NoteDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    const [toast, setToast] = useState(null);

    const [showDeleteConfirm, setShowDeleteConfirm] =
        useState(false);

    const [isDarkMode, setIsDarkMode] = useState(
        document.documentElement.classList.contains("dark")
    );

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDarkMode(
                document.documentElement.classList.contains("dark")
            );
        });

        observer.observe(
            document.documentElement,
            {
                attributes: true,
                attributeFilter: ["class"],
            }
        );

        return () => observer.disconnect();
    }, []);

    /*
    =============================================================
    EXPLICIT THEME
    -------------------------------------------------------------
    NoteDetails does not rely on Tailwind dark: variants for the
    main content. This keeps light mode genuinely light and dark
    mode genuinely dark even when global styles are present.
    =============================================================
    */

    const pageTheme = isDarkMode
        ? "text-slate-100"
        : "text-slate-700";

    const cardTheme = isDarkMode
        ? "border-slate-800 bg-slate-950 shadow-[0_30px_90px_rgba(0,0,0,0.35)]"
        : "border-slate-200/80 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.08)]";

    const primaryText = isDarkMode
        ? "text-white"
        : "text-slate-800";

    const bodyText = isDarkMode
        ? "text-slate-300"
        : "text-slate-700";

    const mutedText = isDarkMode
        ? "text-slate-500"
        : "text-slate-400";

    const subtleCard = isDarkMode
        ? "border-slate-800 bg-slate-800/55"
        : "border-slate-200 bg-slate-50/70";

    const innerCard = isDarkMode
        ? "border-slate-700 bg-slate-900/55"
        : "border-slate-200/80 bg-white/80";

    useEffect(() => {
        const fetchNote = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await API.get(
                    `notes/${id}/`
                );

                setNote(response.data);
            } catch (err) {
                console.error(
                    "Note Details Error:",
                    err
                );

                if (err.response?.status === 404) {
                    setError(
                        "This note could not be found."
                    );
                } else {
                    setError(
                        err.response?.data?.detail ||
                            "Failed to load note details."
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        fetchNote();
    }, [id]);

    const isOwner = useMemo(() => {
        if (!note) return false;

        const loggedInUsername =
            localStorage
                .getItem("username")
                ?.trim()
                .toLowerCase();

        const uploaderUsername =
            note?.uploader_name
                ?.trim()
                .toLowerCase();

        return Boolean(
            loggedInUsername &&
                uploaderUsername &&
                loggedInUsername === uploaderUsername
        );
    }, [note]);

    const handleDelete = async () => {
        if (!note || deleting) return;

        setShowDeleteConfirm(true);
    };

    const confirmDeleteNote = async () => {
        if (!note || deleting) return;

        try {
            setDeleting(true);

            await API.delete(
                `notes/delete/${note.id}/`
            );

            sessionStorage.setItem(
                "noteshare_success",
                "Note deleted successfully!"
            );

            window.dispatchEvent(
                new Event("noteshare:success")
            );

            setShowDeleteConfirm(false);

            navigate("/notes");
        } catch (err) {
            console.error(
                "Delete Note Error:",
                err
            );

            if (err.response?.status === 401) {
                setToast({
                    type: "error",
                    message: "Please login first.",
                });

                setTimeout(() => {
                    navigate("/login");
                }, 1000);
            } else if (
                err.response?.status === 403
            ) {
                setToast({
                    type: "error",
                    message:
                        "You do not have permission to delete this note.",
                });
            } else {
                setToast({
                    type: "error",
                    message:
                        err.response?.data?.detail ||
                        err.response?.data?.error ||
                        "Delete failed.",
                });
            }
        } finally {
            setDeleting(false);
        }
    };

    // =========================================================
    // ERROR
    // =========================================================

    if (error) {
        return (
            <div className="
                min-h-[70vh]
                px-6
                flex
                items-center
                justify-center
            ">
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 16,
                        scale: 0.98,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                    }}
                    transition={{
                        duration: 0.4,
                        ease: "easeOut",
                    }}
                    className={`
                        w-full
                        max-w-lg
                        rounded-[30px]
                        border
                        p-10
                        text-center
                        transition-all
                        duration-300
                        ${cardTheme}
                    `}
                >
                    <div
                        className={`
                            mx-auto
                            flex
                            h-16
                            w-16
                            items-center
                            justify-center
                            rounded-2xl
                            ${
                                isDarkMode
                                    ? "bg-red-500/10 text-red-400 ring-1 ring-red-500/15"
                                    : "bg-red-50 text-red-500 ring-1 ring-red-100"
                            }
                        `}
                    >
                        <FileText size={28} />
                    </div>

                    <h2
                        className={`
                            mt-6
                            text-3xl
                            font-black
                            tracking-tight
                            ${primaryText}
                        `}
                    >
                        Note Not Found
                    </h2>

                    <p
                        className={`
                            mt-3
                            leading-7
                            ${mutedText}
                        `}
                    >
                        {error ||
                            "The requested study note is unavailable."}
                    </p>

                    <button
                        onClick={() =>
                            navigate("/notes")
                        }
                        className="
                            mt-7
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            bg-blue-600
                            px-6
                            py-3
                            font-bold
                            text-white
                            shadow-lg
                            shadow-blue-500/15
                            transition-all
                            duration-300
                            hover:-translate-y-0.5
                            hover:bg-blue-700
                            hover:shadow-xl
                        "
                    >
                        <ArrowLeft size={18} />
                        Back to Notes
                    </button>
                </motion.div>
            </div>
        );
    }

    if (!note) {
        return null;
    }

    const uploadedDate = note.uploaded_at
        ? new Date(
              note.uploaded_at
          ).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
          })
        : "Unknown date";

    const uploader =
        note.uploader_name || "Unknown";

    const uploaderInitial =
        uploader.charAt(0).toUpperCase();

    const educationLevel =
        (
            note?.education_level ||
            "university"
        ).toLowerCase();

    const isSchool =
        educationLevel === "school";

    const department =
        note?.department || "";

    const classLevel =
        note?.class_level || "";

    const subject =
        note?.subject || "";

    const chapter =
        note?.chapter || "";

    const board =
        note?.board || "";

    const semester =
        note?.semester || "";

    const course =
        note?.course || "";

    return (
        <section
            className={`
                mx-auto
                max-w-6xl
                px-4
                py-6
                transition-colors
                duration-300
                sm:px-6
                sm:py-10
                ${pageTheme}
            `}
        >

            <Toast
                toast={toast}
                onClose={() => setToast(null)}
            />

            {/* =====================================================
                BACK
            ====================================================== */}

            <motion.button
                initial={{
                    opacity: 0,
                    x: -8,
                }}
                animate={{
                    opacity: 1,
                    x: 0,
                }}
                onClick={() =>
                    navigate("/notes")
                }
                className={`
                    note-details-back
                    group
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    px-4
                    py-2.5
                    text-sm
                    font-bold
                    shadow-sm
                    backdrop-blur-sm
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:shadow-md
                    ${
                        isDarkMode
                            ? "border-slate-700 bg-slate-900/90 text-slate-300 hover:border-blue-500/50 hover:text-blue-400"
                            : "border-slate-200 bg-white/90 text-slate-600 hover:border-blue-200 hover:text-blue-600"
                    }
                `}
            >
                <ArrowLeft
                    size={17}
                    className="
                        transition-transform
                        duration-300
                        group-hover:-translate-x-0.5
                    "
                />

                Back to Notes
            </motion.button>

            {/* =====================================================
                MAIN ARTICLE
            ====================================================== */}

            <motion.article
                initial={{
                    opacity: 0,
                    y: 18,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                transition={{
                    duration: 0.55,
                    ease: "easeOut",
                }}
                className={`
                    note-details-card
                    mt-7
                    overflow-hidden
                    rounded-[34px]
                    border
                    ring-1
                    transition-all
                    duration-300
                    ${cardTheme}
                    ${
                        isDarkMode
                            ? "ring-white/[0.03]"
                            : "ring-slate-950/[0.02]"
                    }
                `}
            >

                {/* =================================================
                    HERO
                ================================================== */}

                <div className="
                    relative
                    overflow-hidden
                    bg-gradient-to-br
                    from-slate-950
                    via-blue-950
                    to-cyan-800
                    text-white
                ">
                    <motion.div
                        animate={{
                            x: [0, 25, 0],
                            y: [0, -20, 0],
                            scale: [1, 1.08, 1],
                        }}
                        transition={{
                            duration: 9,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="
                            pointer-events-none
                            absolute
                            -right-24
                            -top-24
                            h-96
                            w-96
                            rounded-full
                            bg-cyan-400/15
                            blur-3xl
                        "
                    />

                    <motion.div
                        animate={{
                            x: [0, -20, 0],
                            y: [0, 20, 0],
                            scale: [1, 1.08, 1],
                        }}
                        transition={{
                            duration: 11,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="
                            pointer-events-none
                            absolute
                            -bottom-28
                            -left-24
                            h-96
                            w-96
                            rounded-full
                            bg-blue-500/15
                            blur-3xl
                        "
                    />

                    <div
                        className="
                            pointer-events-none
                            absolute
                            inset-0
                            opacity-20
                            [background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)]
                            [background-size:36px_36px]
                        "
                    />

                    <div className="
                        relative
                        px-6
                        py-9
                        sm:px-9
                        sm:py-12
                        lg:px-12
                        lg:py-14
                    ">

                        <div className="
                            flex
                            flex-col
                            gap-7
                            md:flex-row
                            md:items-center
                        ">

                            <motion.div
                                initial={{
                                    opacity: 0,
                                    scale: 0.85,
                                    rotate: -5,
                                }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    rotate: 0,
                                }}
                                transition={{
                                    duration: 0.5,
                                }}
                                whileHover={{
                                    scale: 1.04,
                                    rotate: -2,
                                }}
                                className="
                                    flex
                                    h-24
                                    w-24
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-[28px]
                                    border
                                    border-white/10
                                    bg-white/10
                                    text-white
                                    shadow-2xl
                                    shadow-black/10
                                    backdrop-blur-xl
                                "
                            >
                                {isSchool ? (
                                    <School size={42} />
                                ) : (
                                    <FileText size={42} />
                                )}
                            </motion.div>

                            <div className="min-w-0">

                                <div className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-full
                                    border
                                    border-white/10
                                    bg-white/10
                                    px-4
                                    py-2
                                    text-[11px]
                                    font-black
                                    uppercase
                                    tracking-[0.16em]
                                    text-cyan-100
                                    backdrop-blur-sm
                                ">
                                    <BookOpen size={14} />
                                    Study Note
                                </div>

                                <h1 className="
                                    mt-5
                                    break-words
                                    text-4xl
                                    font-black
                                    leading-[1.05]
                                    tracking-tight
                                    sm:text-5xl
                                ">
                                    {note.title}
                                </h1>

                                <div className="
                                    mt-5
                                    flex
                                    flex-wrap
                                    gap-2
                                ">

                                    <span className="
                                        inline-flex
                                        items-center
                                        gap-1.5
                                        rounded-full
                                        border
                                        border-white/10
                                        bg-white/10
                                        px-3
                                        py-1.5
                                        text-xs
                                        font-bold
                                        text-cyan-100
                                        backdrop-blur-sm
                                    ">
                                        {isSchool ? (
                                            <>
                                                <School size={13} />
                                                School / College
                                            </>
                                        ) : (
                                            <>
                                                <GraduationCap size={13} />
                                                University
                                            </>
                                        )}
                                    </span>

                                    {isSchool ? (
                                        <>
                                            {classLevel && (
                                                <span className="
                                                    inline-flex
                                                    items-center
                                                    gap-1.5
                                                    rounded-full
                                                    border
                                                    border-white/10
                                                    bg-white/10
                                                    px-3
                                                    py-1.5
                                                    text-xs
                                                    font-bold
                                                    text-blue-100
                                                ">
                                                    <School size={13} />
                                                    {classLevel}
                                                </span>
                                            )}

                                            {subject && (
                                                <span className="
                                                    inline-flex
                                                    items-center
                                                    gap-1.5
                                                    rounded-full
                                                    border
                                                    border-white/10
                                                    bg-white/10
                                                    px-3
                                                    py-1.5
                                                    text-xs
                                                    font-bold
                                                    text-cyan-100
                                                ">
                                                    <BookOpen size={13} />
                                                    {subject}
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {department && (
                                                <span className="
                                                    inline-flex
                                                    items-center
                                                    gap-1.5
                                                    rounded-full
                                                    border
                                                    border-white/10
                                                    bg-white/10
                                                    px-3
                                                    py-1.5
                                                    text-xs
                                                    font-bold
                                                    text-blue-100
                                                ">
                                                    <Layers3 size={13} />
                                                    {department}
                                                </span>
                                            )}

                                            {semester && (
                                                <span className="
                                                    inline-flex
                                                    items-center
                                                    rounded-full
                                                    border
                                                    border-white/10
                                                    bg-white/10
                                                    px-3
                                                    py-1.5
                                                    text-xs
                                                    font-bold
                                                    text-violet-100
                                                ">
                                                    {semester}
                                                </span>
                                            )}

                                            {course && (
                                                <span className="
                                                    inline-flex
                                                    items-center
                                                    gap-1.5
                                                    rounded-full
                                                    border
                                                    border-white/10
                                                    bg-white/10
                                                    px-3
                                                    py-1.5
                                                    text-xs
                                                    font-bold
                                                    text-emerald-100
                                                ">
                                                    <BookOpen size={13} />
                                                    {course}
                                                </span>
                                            )}
                                        </>
                                    )}

                                    {isSchool &&
                                        chapter && (
                                            <span className="
                                                inline-flex
                                                items-center
                                                gap-1.5
                                                rounded-full
                                                border
                                                border-white/10
                                                bg-white/10
                                                px-3
                                                py-1.5
                                                text-xs
                                                font-bold
                                                text-slate-200
                                            ">
                                                <FileText size={13} />
                                                {chapter}
                                            </span>
                                        )}

                                    {isSchool &&
                                        board && (
                                            <span className="
                                                inline-flex
                                                items-center
                                                gap-1.5
                                                rounded-full
                                                border
                                                border-emerald-300/10
                                                bg-emerald-400/10
                                                px-3
                                                py-1.5
                                                text-xs
                                                font-bold
                                                text-emerald-100
                                            ">
                                                {board}
                                            </span>
                                        )}
                                </div>
                            </div>
                        </div>

                        <div className="
                            relative
                            mt-8
                            flex
                            flex-wrap
                            gap-3
                            border-t
                            border-white/10
                            pt-6
                        ">
                            <span className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-full
                                bg-white/5
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-slate-300
                            ">
                                <Eye size={14} />
                                {note.views || 0} views
                            </span>

                            <span className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-full
                                bg-white/5
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-slate-300
                            ">
                                <Download size={14} />
                                {note.downloads || 0} downloads
                            </span>

                            <span className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-full
                                bg-white/5
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-slate-300
                            ">
                                <ShieldCheck size={14} />
                                Community resource
                            </span>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    BODY
                ================================================== */}

                <div
                    className={`
                        p-6
                        transition-colors
                        duration-300
                        sm:p-9
                        lg:p-12
                        ${
                            isDarkMode
                                ? "bg-slate-950"
                                : "bg-white"
                        }
                    `}
                >

                    {/* =================================================
                        META CARDS
                    ================================================== */}

                    <div className="
                        grid
                        gap-4
                        sm:grid-cols-2
                        lg:grid-cols-4
                    ">

                        {[
                            {
                                icon: CalendarDays,
                                label: "Uploaded",
                                content: (
                                    <p
                                        className={`
                                            mt-2
                                            font-bold
                                            ${bodyText}
                                        `}
                                    >
                                        {uploadedDate}
                                    </p>
                                ),
                            },
                            {
                                icon: User,
                                label: "Uploaded By",
                                content: (
                                    <div className="
                                        mt-2
                                        flex
                                        min-w-0
                                        items-center
                                        gap-2
                                    ">
                                        <div className="
                                            flex
                                            h-7
                                            w-7
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-gradient-to-br
                                            from-slate-800
                                            to-slate-500
                                            text-[11px]
                                            font-black
                                            text-white
                                            shadow-sm
                                        ">
                                            {uploaderInitial}
                                        </div>

                                        <p
                                            className={`
                                                truncate
                                                font-bold
                                                ${bodyText}
                                            `}
                                        >
                                            {uploader}
                                        </p>
                                    </div>
                                ),
                            },
                            {
                                icon: Eye,
                                label: "Views",
                                content: (
                                    <p
                                        className={`
                                            mt-1
                                            text-3xl
                                            font-black
                                            tracking-tight
                                            ${primaryText}
                                        `}
                                    >
                                        {note.views || 0}
                                    </p>
                                ),
                            },
                            {
                                icon: Download,
                                label: "Downloads",
                                content: (
                                    <p
                                        className={`
                                            mt-1
                                            text-3xl
                                            font-black
                                            tracking-tight
                                            ${primaryText}
                                        `}
                                    >
                                        {note.downloads || 0}
                                    </p>
                                ),
                            },
                        ].map((item) => {
                            const Icon = item.icon;

                            return (
                                <motion.div
                                    key={item.label}
                                    whileHover={{
                                        y: -3,
                                    }}
                                    transition={{
                                        duration: 0.2,
                                    }}
                                    className={`
                                        note-details-meta
                                        rounded-2xl
                                        border
                                        p-5
                                        shadow-sm
                                        transition-all
                                        duration-300
                                        ${subtleCard}
                                        ${
                                            isDarkMode
                                                ? "shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
                                                : "hover:shadow-md"
                                        }
                                    `}
                                >
                                    <div
                                        className={`
                                            flex
                                            items-center
                                            gap-2
                                            ${mutedText}
                                        `}
                                    >
                                        <Icon size={17} />

                                        <span className="
                                            text-[10px]
                                            font-black
                                            uppercase
                                            tracking-wider
                                        ">
                                            {item.label}
                                        </span>
                                    </div>

                                    {item.content}
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* =================================================
                        ACADEMIC INFORMATION
                    ================================================== */}

                    {(isSchool ||
                        department ||
                        semester ||
                        course) && (
                        <motion.div
                            initial={{
                                opacity: 0,
                                y: 12,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                duration: 0.45,
                                delay: 0.05,
                            }}
                            className={`
                                mt-8
                                rounded-[28px]
                                border
                                p-6
                                shadow-sm
                                transition-colors
                                duration-300
                                sm:p-7
                                ${
                                    isDarkMode
                                        ? "border-blue-500/15 bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 shadow-none"
                                        : "border-blue-100 bg-gradient-to-br from-blue-50/80 via-white to-cyan-50/50"
                                }
                            `}
                        >

                            <div className="
                                flex
                                items-start
                                gap-3
                            ">

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
                                    to-cyan-500
                                    text-white
                                    shadow-lg
                                    shadow-blue-500/15
                                ">
                                    {isSchool ? (
                                        <School size={20} />
                                    ) : (
                                        <GraduationCap size={21} />
                                    )}
                                </div>

                                <div>
                                    <p className="
                                        text-[10px]
                                        font-black
                                        uppercase
                                        tracking-[0.16em]
                                        text-blue-600
                                    ">
                                        Academic Context
                                    </p>

                                    <h2
                                        className={`
                                            mt-1
                                            text-xl
                                            font-black
                                            ${primaryText}
                                        `}
                                    >
                                        Resource Information
                                    </h2>
                                </div>
                            </div>

                            <div className="
                                mt-6
                                grid
                                gap-3
                                sm:grid-cols-2
                                lg:grid-cols-4
                            ">

                                <div
                                    className={`
                                        rounded-2xl
                                        border
                                        p-4
                                        shadow-sm
                                        ${innerCard}
                                    `}
                                >
                                    <p
                                        className={`
                                            text-[10px]
                                            font-black
                                            uppercase
                                            tracking-wider
                                            ${mutedText}
                                        `}
                                    >
                                        Level
                                    </p>

                                    <p
                                        className={`
                                            mt-1.5
                                            font-black
                                            ${bodyText}
                                        `}
                                    >
                                        {isSchool
                                            ? "School / College"
                                            : "University"}
                                    </p>
                                </div>

                                {isSchool ? (
                                    <>
                                        {classLevel && (
                                            <div
                                                className={`
                                                    rounded-2xl
                                                    border
                                                    p-4
                                                    shadow-sm
                                                    ${innerCard}
                                                `}
                                            >
                                                <p
                                                    className={`
                                                        text-[10px]
                                                        font-black
                                                        uppercase
                                                        tracking-wider
                                                        ${mutedText}
                                                    `}
                                                >
                                                    Class
                                                </p>

                                                <p
                                                    className={`
                                                        mt-1.5
                                                        font-black
                                                        ${bodyText}
                                                    `}
                                                >
                                                    {classLevel}
                                                </p>
                                            </div>
                                        )}

                                        {subject && (
                                            <div
                                                className={`
                                                    rounded-2xl
                                                    border
                                                    p-4
                                                    shadow-sm
                                                    ${innerCard}
                                                `}
                                            >
                                                <p
                                                    className={`
                                                        text-[10px]
                                                        font-black
                                                        uppercase
                                                        tracking-wider
                                                        ${mutedText}
                                                    `}
                                                >
                                                    Subject
                                                </p>

                                                <p
                                                    className={`
                                                        mt-1.5
                                                        font-black
                                                        ${bodyText}
                                                    `}
                                                >
                                                    {subject}
                                                </p>
                                            </div>
                                        )}

                                        {(chapter ||
                                            board) && (
                                            <div
                                                className={`
                                                    rounded-2xl
                                                    border
                                                    p-4
                                                    shadow-sm
                                                    ${innerCard}
                                                `}
                                            >
                                                <p
                                                    className={`
                                                        text-[10px]
                                                        font-black
                                                        uppercase
                                                        tracking-wider
                                                        ${mutedText}
                                                    `}
                                                >
                                                    {chapter
                                                        ? "Chapter / Topic"
                                                        : "Board"}
                                                </p>

                                                <p
                                                    className={`
                                                        mt-1.5
                                                        font-black
                                                        ${bodyText}
                                                    `}
                                                >
                                                    {chapter ||
                                                        board}
                                                </p>

                                                {chapter &&
                                                    board && (
                                                        <p
                                                            className={`
                                                                mt-1
                                                                text-xs
                                                                font-semibold
                                                                ${mutedText}
                                                            `}
                                                        >
                                                            {board}
                                                        </p>
                                                    )}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {department && (
                                            <div
                                                className={`
                                                    rounded-2xl
                                                    border
                                                    p-4
                                                    shadow-sm
                                                    ${innerCard}
                                                `}
                                            >
                                                <p
                                                    className={`
                                                        text-[10px]
                                                        font-black
                                                        uppercase
                                                        tracking-wider
                                                        ${mutedText}
                                                    `}
                                                >
                                                    Department
                                                </p>

                                                <p
                                                    className={`
                                                        mt-1.5
                                                        font-black
                                                        ${bodyText}
                                                    `}
                                                >
                                                    {department}
                                                </p>
                                            </div>
                                        )}

                                        {semester && (
                                            <div
                                                className={`
                                                    rounded-2xl
                                                    border
                                                    p-4
                                                    shadow-sm
                                                    ${innerCard}
                                                `}
                                            >
                                                <p
                                                    className={`
                                                        text-[10px]
                                                        font-black
                                                        uppercase
                                                        tracking-wider
                                                        ${mutedText}
                                                    `}
                                                >
                                                    Semester
                                                </p>

                                                <p
                                                    className={`
                                                        mt-1.5
                                                        font-black
                                                        ${bodyText}
                                                    `}
                                                >
                                                    {semester}
                                                </p>
                                            </div>
                                        )}

                                        {course && (
                                            <div
                                                className={`
                                                    rounded-2xl
                                                    border
                                                    p-4
                                                    shadow-sm
                                                    ${innerCard}
                                                `}
                                            >
                                                <p
                                                    className={`
                                                        text-[10px]
                                                        font-black
                                                        uppercase
                                                        tracking-wider
                                                        ${mutedText}
                                                    `}
                                                >
                                                    Course / Subject
                                                </p>

                                                <p
                                                    className={`
                                                        mt-1.5
                                                        font-black
                                                        ${bodyText}
                                                    `}
                                                >
                                                    {course}
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}

                            </div>
                        </motion.div>
                    )}

                    {/* =================================================
                        DESCRIPTION
                    ================================================== */}

                    <div className="mt-10">

                        <div className="
                            flex
                            items-center
                            gap-3
                        ">
                            <div
                                className={`
                                    flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-xl
                                    ${
                                        isDarkMode
                                            ? "bg-blue-500/10 text-blue-400"
                                            : "bg-blue-50 text-blue-600"
                                    }
                                `}
                            >
                                <FileText size={19} />
                            </div>

                            <div>
                                <h2
                                    className={`
                                        text-2xl
                                        font-black
                                        ${primaryText}
                                    `}
                                >
                                    Description
                                </h2>

                                <p
                                    className={`
                                        mt-1
                                        text-xs
                                        ${mutedText}
                                    `}
                                >
                                    About this study resource
                                </p>
                            </div>
                        </div>

                        <div
                            className={`
                                note-details-description
                                mt-5
                                rounded-[26px]
                                border
                                p-6
                                shadow-sm
                                transition-colors
                                duration-300
                                sm:p-8
                                ${subtleCard}
                            `}
                        >
                            <p
                                className={`
                                    whitespace-pre-line
                                    text-base
                                    leading-8
                                    sm:text-lg
                                    ${bodyText}
                                `}
                            >
                                {note.description ||
                                    "No description provided."}
                            </p>
                        </div>
                    </div>

                    {/* =================================================
                        DOWNLOAD CTA
                    ================================================== */}

                    <motion.div
                        whileHover={{
                            y: -2,
                        }}
                        className="
                            relative
                            mt-10
                            overflow-hidden
                            rounded-[30px]
                            bg-gradient-to-br
                            from-blue-600
                            via-blue-700
                            to-cyan-500
                            p-7
                            text-white
                            shadow-[0_20px_50px_rgba(37,99,235,0.18)]
                            sm:p-8
                        "
                    >
                        <div className="
                            pointer-events-none
                            absolute
                            -right-12
                            -top-12
                            h-40
                            w-40
                            rounded-full
                            bg-white/10
                            blur-2xl
                        " />

                        <div className="
                            pointer-events-none
                            absolute
                            -bottom-16
                            -left-10
                            h-40
                            w-40
                            rounded-full
                            bg-cyan-300/10
                            blur-2xl
                        " />

                        <div className="
                            relative
                            flex
                            flex-col
                            gap-7
                            md:flex-row
                            md:items-center
                            md:justify-between
                        ">
                            <div>
                                <div className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-full
                                    border
                                    border-white/10
                                    bg-white/10
                                    px-3
                                    py-1.5
                                    text-xs
                                    font-bold
                                ">
                                    <Sparkles size={14} />
                                    Study Offline
                                </div>

                                <h3 className="
                                    mt-4
                                    text-2xl
                                    font-black
                                    tracking-tight
                                ">
                                    Download this note
                                </h3>

                                <p className="
                                    mt-2
                                    max-w-2xl
                                    text-sm
                                    leading-6
                                    text-blue-100
                                ">
                                    Get the original file and keep this
                                    resource available for offline study.
                                </p>
                            </div>

                            <a
                                href={`${API.defaults.baseURL}notes/download/${note.id}/`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="
                                    group
                                    inline-flex
                                    shrink-0
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    bg-white
                                    px-6
                                    py-3.5
                                    font-black
                                    text-blue-700
                                    shadow-xl
                                    transition-all
                                    duration-300
                                    hover:-translate-y-1
                                    hover:bg-blue-50
                                    hover:shadow-2xl
                                "
                            >
                                <Download size={18} />
                                Download Note

                                <ArrowUpRight
                                    size={16}
                                    className="
                                        transition-transform
                                        duration-300
                                        group-hover:-translate-y-0.5
                                        group-hover:translate-x-0.5
                                    "
                                />
                            </a>
                        </div>
                    </motion.div>

                    {/* =================================================
                        OWNER ACTIONS
                    ================================================== */}

                    {isOwner && (
                        <motion.div
                            initial={{
                                opacity: 0,
                                y: 12,
                            }}
                            whileInView={{
                                opacity: 1,
                                y: 0,
                            }}
                            viewport={{
                                once: true,
                            }}
                            className={`
                                note-details-owner
                                mt-10
                                rounded-[28px]
                                border
                                p-6
                                transition-colors
                                duration-300
                                ${
                                    isDarkMode
                                        ? "border-amber-500/15 bg-gradient-to-br from-amber-500/10 to-red-500/5"
                                        : "border-amber-100 bg-gradient-to-br from-amber-50 to-red-50/50"
                                }
                            `}
                        >
                            <div className="
                                flex
                                items-center
                                gap-3
                            ">
                                <div
                                    className={`
                                        flex
                                        h-10
                                        w-10
                                        items-center
                                        justify-center
                                        rounded-xl
                                        ${
                                            isDarkMode
                                                ? "bg-amber-500/10 text-amber-400"
                                                : "bg-amber-100 text-amber-600"
                                        }
                                    `}
                                >
                                    <Pencil size={18} />
                                </div>

                                <div>
                                    <h3
                                        className={`
                                            font-black
                                            ${primaryText}
                                        `}
                                    >
                                        Manage Your Note
                                    </h3>

                                    <p
                                        className={`
                                            mt-1
                                            text-xs
                                            ${mutedText}
                                        `}
                                    >
                                        Edit or remove your uploaded resource.
                                    </p>
                                </div>
                            </div>

                            <div className="
                                mt-5
                                grid
                                gap-3
                                sm:grid-cols-2
                            ">

                                <button
                                    onClick={() =>
                                        navigate(
                                            `/edit/${note.id}`
                                        )
                                    }
                                    className="
                                        inline-flex
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-xl
                                        bg-amber-500
                                        px-5
                                        py-3.5
                                        font-bold
                                        text-white
                                        shadow-sm
                                        transition-all
                                        duration-300
                                        hover:-translate-y-0.5
                                        hover:bg-amber-600
                                        hover:shadow-lg
                                        hover:shadow-amber-500/15
                                    "
                                >
                                    <Pencil size={18} />
                                    Edit Note
                                </button>

                                <button
                                    onClick={
                                        handleDelete
                                    }
                                    disabled={deleting}
                                    className="
                                        inline-flex
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-xl
                                        bg-red-600
                                        px-5
                                        py-3.5
                                        font-bold
                                        text-white
                                        shadow-sm
                                        transition-all
                                        duration-300
                                        hover:-translate-y-0.5
                                        hover:bg-red-700
                                        hover:shadow-lg
                                        hover:shadow-red-500/15
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >
                                    {deleting ? (
                                        <>
                                            <Loader2
                                                size={18}
                                                className="animate-spin"
                                            />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={18} />
                                            Delete Note
                                        </>
                                    )}
                                </button>

                            </div>
                        </motion.div>
                    )}

                    {/* =================================================
                        BOTTOM NAV
                    ================================================== */}

                    <div
                        className={`
                            note-details-footer
                            mt-10
                            flex
                            flex-col
                            items-center
                            justify-between
                            gap-4
                            border-t
                            pt-7
                            transition-colors
                            duration-300
                            sm:flex-row
                            ${
                                isDarkMode
                                    ? "border-slate-800"
                                    : "border-slate-100"
                            }
                        `}
                    >
                        <button
                            onClick={() =>
                                navigate("/notes")
                            }
                            className="
                                inline-flex
                                items-center
                                gap-2
                                font-bold
                                text-blue-600
                                transition
                                hover:text-blue-700
                            "
                        >
                            <ArrowLeft size={16} />
                            Back to Notes
                        </button>

                        <button
                            onClick={() =>
                                window.scrollTo({
                                    top: 0,
                                    behavior: "smooth",
                                })
                            }
                            className={`
                                inline-flex
                                items-center
                                gap-2
                                font-semibold
                                transition
                                ${
                                    isDarkMode
                                        ? "text-slate-500 hover:text-slate-200"
                                        : "text-slate-400 hover:text-slate-700"
                                }
                            `}
                        >
                            Back to Top
                            <ArrowUpRight size={15} />
                        </button>
                    </div>

                </div>
            </motion.article>

            {/* =====================================================
                DELETE CONFIRMATION
            ====================================================== */}

            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="
                            fixed
                            inset-0
                            z-[9998]
                            flex
                            items-center
                            justify-center
                            bg-slate-950/50
                            px-4
                            backdrop-blur-sm
                        "
                        onClick={() =>
                            !deleting &&
                            setShowDeleteConfirm(false)
                        }
                    >
                        <motion.div
                            initial={{
                                opacity: 0,
                                y: 18,
                                scale: 0.94,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1,
                            }}
                            exit={{
                                opacity: 0,
                                y: 10,
                                scale: 0.97,
                            }}
                            transition={{
                                duration: 0.28,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                            className={`
                                relative
                                w-full
                                max-w-md
                                overflow-hidden
                                rounded-[30px]
                                border
                                shadow-[0_30px_100px_rgba(15,23,42,0.24)]
                                transition-colors
                                duration-300
                                ${
                                    isDarkMode
                                        ? "border-slate-700 bg-slate-900"
                                        : "border-slate-200/80 bg-white"
                                }
                            `}
                        >
                            <div className="
                                pointer-events-none
                                absolute
                                -right-20
                                -top-20
                                h-44
                                w-44
                                rounded-full
                                bg-red-500/10
                                blur-3xl
                            " />

                            <div className="
                                relative
                                p-7
                                sm:p-8
                            ">

                                <div className="
                                    flex
                                    h-14
                                    w-14
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-gradient-to-br
                                    from-red-500
                                    to-rose-600
                                    text-white
                                    shadow-lg
                                    shadow-red-500/20
                                ">
                                    <Trash2 size={23} />
                                </div>

                                <p className="
                                    mt-6
                                    text-[10px]
                                    font-black
                                    uppercase
                                    tracking-[0.18em]
                                    text-red-500
                                ">
                                    Permanent action
                                </p>

                                <h3
                                    className={`
                                        mt-2
                                        text-2xl
                                        font-black
                                        tracking-tight
                                        ${primaryText}
                                    `}
                                >
                                    Delete this note?
                                </h3>

                                <p
                                    className={`
                                        mt-3
                                        text-sm
                                        leading-6
                                        ${mutedText}
                                    `}
                                >
                                    You are about to permanently remove
                                    this study resource from NoteShare.
                                </p>

                                <div
                                    className={`
                                        mt-5
                                        rounded-2xl
                                        border
                                        p-4
                                        ${
                                            isDarkMode
                                                ? "border-red-500/15 bg-red-500/5"
                                                : "border-red-100 bg-red-50/70"
                                        }
                                    `}
                                >
                                    <p className="
                                        text-[10px]
                                        font-black
                                        uppercase
                                        tracking-[0.14em]
                                        text-red-500
                                    ">
                                        Note
                                    </p>

                                    <p
                                        className={`
                                            mt-1
                                            truncate
                                            text-sm
                                            font-bold
                                            ${bodyText}
                                        `}
                                    >
                                        {note.title}
                                    </p>
                                </div>

                                <div className="
                                    mt-7
                                    grid
                                    grid-cols-2
                                    gap-3
                                ">

                                    <button
                                        type="button"
                                        disabled={deleting}
                                        onClick={() =>
                                            setShowDeleteConfirm(false)
                                        }
                                        className={`
                                            rounded-2xl
                                            border
                                            px-4
                                            py-3.5
                                            text-sm
                                            font-bold
                                            transition-all
                                            duration-300
                                            hover:-translate-y-0.5
                                            hover:shadow-sm
                                            ${
                                                isDarkMode
                                                    ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                                                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                            }
                                        `}
                                    >
                                        Keep Note
                                    </button>

                                    <button
                                        type="button"
                                        disabled={deleting}
                                        onClick={
                                            confirmDeleteNote
                                        }
                                        className="
                                            inline-flex
                                            items-center
                                            justify-center
                                            gap-2
                                            rounded-2xl
                                            bg-gradient-to-r
                                            from-red-600
                                            to-rose-500
                                            px-4
                                            py-3.5
                                            text-sm
                                            font-black
                                            text-white
                                            shadow-lg
                                            shadow-red-500/20
                                            transition-all
                                            duration-300
                                            hover:-translate-y-0.5
                                            hover:shadow-xl
                                            disabled:cursor-not-allowed
                                            disabled:opacity-60
                                        "
                                    >
                                        {deleting ? (
                                            <>
                                                <Loader2
                                                    size={17}
                                                    className="animate-spin"
                                                />
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 size={17} />
                                                Delete Note
                                            </>
                                        )}
                                    </button>

                                </div>

                                <p
                                    className={`
                                        mt-4
                                        text-center
                                        text-[10px]
                                        font-semibold
                                        ${mutedText}
                                    `}
                                >
                                    This action cannot be undone.
                                </p>

                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </section>
    );
}

export default NoteDetails;