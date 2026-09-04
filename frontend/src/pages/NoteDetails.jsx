import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
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
} from "lucide-react";

import API from "../services/api";

function NoteDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

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
                loggedInUsername ===
                    uploaderUsername
        );
    }, [note]);

    const handleDelete = async () => {
        if (!note || deleting) return;

        const confirmed = window.confirm(
            "Are you sure you want to delete this note?"
        );

        if (!confirmed) return;

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

            navigate("/notes");
        } catch (err) {
            console.error(
                "Delete Note Error:",
                err
            );

            if (err.response?.status === 401) {
                alert("Please login first.");
                navigate("/login");
            } else if (
                err.response?.status === 403
            ) {
                alert(
                    "You do not have permission to delete this note."
                );
            } else {
                alert(
                    err.response?.data?.detail ||
                        err.response?.data?.error ||
                        "Delete failed."
                );
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
            <div className="min-h-[70vh] px-6 flex items-center justify-center">
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 16,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    className="w-full max-w-lg rounded-[30px] border border-slate-200 bg-white p-10 text-center shadow-[0_20px_55px_rgba(15,23,42,0.08)]"
                >
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                        <FileText size={28} />
                    </div>

                    <h2 className="mt-6 text-3xl font-black text-slate-800">
                        Note Not Found
                    </h2>

                    <p className="mt-3 leading-7 text-slate-500">
                        {error ||
                            "The requested study note is unavailable."}
                    </p>

                    <button
                        onClick={() =>
                            navigate("/notes")
                        }
                        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/15"
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

    return (
        <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">

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
                onClick={() => navigate("/notes")}
                className="
                    note-details-back
                    group
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-slate-200
                    bg-white/80
                    px-4
                    py-2.5
                    text-sm
                    font-bold
                    text-slate-600
                    shadow-sm
                    backdrop-blur-sm
                    transition
                    hover:border-blue-200
                    hover:text-blue-600
                "
            >
                <ArrowLeft
                    size={17}
                    className="transition-transform duration-300 group-hover:-translate-x-0.5"
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
                className="
                    note-details-card
                    mt-7
                    overflow-hidden
                    rounded-[34px]
                    border
                    border-slate-200/80
                    bg-white
                    shadow-[0_25px_70px_rgba(15,23,42,0.08)]
                "
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

                    <div className="relative px-6 py-9 sm:px-9 sm:py-12 lg:px-12 lg:py-14">

                        <div className="flex flex-col gap-7 md:flex-row md:items-center">

                            {/* Icon */}

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
                                    backdrop-blur-xl
                                "
                            >
                                <FileText size={42} />
                            </motion.div>

                            {/* Title */}

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

                                <div className="mt-5 flex flex-wrap gap-2">
                                    {note.department && (
                                        <span className="
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
                                            {note.department}
                                        </span>
                                    )}

                                    {note.category && (
                                        <span className="
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
                                            {note.category}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Hero bottom meta */}

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

                <div className="p-6 sm:p-9 lg:p-12">

                    {/* =================================================
                        META CARDS
                    ================================================== */}

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        <motion.div
                            whileHover={{
                                y: -2,
                            }}
                            className="
                                note-details-meta
                                rounded-2xl
                                border
                                border-slate-200
                                bg-slate-50/70
                                p-5
                            "
                        >
                            <div className="flex items-center gap-2 text-slate-400">
                                <CalendarDays size={17} />

                                <span className="
                                    text-[10px]
                                    font-black
                                    uppercase
                                    tracking-wider
                                ">
                                    Uploaded
                                </span>
                            </div>

                            <p className="mt-2 font-bold text-slate-700">
                                {uploadedDate}
                            </p>
                        </motion.div>

                        <motion.div
                            whileHover={{
                                y: -2,
                            }}
                            className="
                                note-details-meta
                                rounded-2xl
                                border
                                border-slate-200
                                bg-slate-50/70
                                p-5
                            "
                        >
                            <div className="flex items-center gap-2 text-slate-400">
                                <User size={17} />

                                <span className="
                                    text-[10px]
                                    font-black
                                    uppercase
                                    tracking-wider
                                ">
                                    Uploaded By
                                </span>
                            </div>

                            <div className="mt-2 flex min-w-0 items-center gap-2">
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
                                ">
                                    {uploaderInitial}
                                </div>

                                <p className="truncate font-bold text-slate-700">
                                    {uploader}
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{
                                y: -2,
                            }}
                            className="
                                note-details-meta
                                rounded-2xl
                                border
                                border-slate-200
                                bg-slate-50/70
                                p-5
                            "
                        >
                            <div className="flex items-center gap-2 text-slate-400">
                                <Eye size={17} />

                                <span className="
                                    text-[10px]
                                    font-black
                                    uppercase
                                    tracking-wider
                                ">
                                    Views
                                </span>
                            </div>

                            <p className="
                                mt-1
                                text-3xl
                                font-black
                                tracking-tight
                                text-slate-800
                            ">
                                {note.views || 0}
                            </p>
                        </motion.div>

                        <motion.div
                            whileHover={{
                                y: -2,
                            }}
                            className="
                                note-details-meta
                                rounded-2xl
                                border
                                border-slate-200
                                bg-slate-50/70
                                p-5
                            "
                        >
                            <div className="flex items-center gap-2 text-slate-400">
                                <Download size={17} />

                                <span className="
                                    text-[10px]
                                    font-black
                                    uppercase
                                    tracking-wider
                                ">
                                    Downloads
                                </span>
                            </div>

                            <p className="
                                mt-1
                                text-3xl
                                font-black
                                tracking-tight
                                text-slate-800
                            ">
                                {note.downloads || 0}
                            </p>
                        </motion.div>
                    </div>

                    {/* =================================================
                        DESCRIPTION
                    ================================================== */}

                    <div className="mt-10">

                        <div className="flex items-center gap-3">
                            <div className="
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-xl
                                bg-blue-50
                                text-blue-600
                            ">
                                <FileText size={19} />
                            </div>

                            <div>
                                <h2 className="text-2xl font-black text-slate-800">
                                    Description
                                </h2>

                                <p className="mt-1 text-xs text-slate-400">
                                    About this study resource
                                </p>
                            </div>
                        </div>

                        <div className="
                            note-details-description
                            mt-5
                            rounded-[26px]
                            border
                            border-slate-200/80
                            bg-slate-50/70
                            p-6
                            sm:p-8
                        ">
                            <p className="
                                whitespace-pre-line
                                text-base
                                leading-8
                                text-slate-700
                                sm:text-lg
                            ">
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
                        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

                        <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-cyan-300/10 blur-2xl" />

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
                                    transition
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
                            className="
                                note-details-owner
                                mt-10
                                rounded-[28px]
                                border
                                border-amber-100
                                bg-gradient-to-br
                                from-amber-50
                                to-red-50/50
                                p-6
                            "
                        >
                            <div className="flex items-center gap-3">
                                <div className="
                                    flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-amber-100
                                    text-amber-600
                                ">
                                    <Pencil size={18} />
                                </div>

                                <div>
                                    <h3 className="font-black text-slate-800">
                                        Manage Your Note
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Edit or remove your uploaded resource.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
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
                                        transition
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
                                        transition
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

                    <div className="
                        note-details-footer
                        mt-10
                        flex
                        flex-col
                        items-center
                        justify-between
                        gap-4
                        border-t
                        border-slate-100
                        pt-7
                        sm:flex-row
                    ">
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
                            className="
                                inline-flex
                                items-center
                                gap-2
                                font-semibold
                                text-slate-400
                                transition
                                hover:text-slate-700
                            "
                        >
                            Back to Top
                            <ArrowUpRight size={15} />
                        </button>
                    </div>
                </div>
            </motion.article>
        </section>
    );
}

export default NoteDetails;