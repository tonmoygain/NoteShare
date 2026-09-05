import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useNavigate, useParams } from "react-router-dom";

import {
    FileText,
    Upload,
    ArrowLeft,
    Save,
    Loader2,
    Eye,
    Sparkles,
    CheckCircle2,
    ShieldCheck,
    GraduationCap,
    School,
    BookOpen,
    Layers3,
} from "lucide-react";

import API from "../services/api";
import Toast from "../components/Toast";

function EditNote() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState("");

    const [educationLevel, setEducationLevel] =
        useState("university");

    const [department, setDepartment] =
        useState("");

    const [classLevel, setClassLevel] =
        useState("");

    const [subject, setSubject] =
        useState("");

    const [chapter, setChapter] =
        useState("");

    const [board, setBoard] =
        useState("");

    const [semester, setSemester] =
        useState("");

    const [course, setCourse] =
        useState("");

    const [description, setDescription] =
        useState("");

    const [file, setFile] = useState(null);
    const [oldFile, setOldFile] = useState("");

    const [error, setError] = useState("");
    const [toast, setToast] = useState(null);

    const isSchool =
        educationLevel === "school";

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
    THEME
    -------------------------------------------------------------
    IMPORTANT:
    We intentionally do NOT use Tailwind dark: classes for the
    main Edit Note content. This prevents the global dark-mode
    styling from leaking into light mode.
    =============================================================
    */

    const pageBg = isDarkMode
        ? "bg-slate-950 text-slate-100"
        : "bg-white text-slate-700";

    const mainCard = isDarkMode
        ? "border-slate-800 bg-slate-950 shadow-[0_30px_80px_rgba(0,0,0,0.30)]"
        : "border-slate-200 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.08)]";

    const inputTheme = isDarkMode
        ? "border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-500 hover:border-slate-600 focus:border-blue-500 focus:bg-slate-800 focus:ring-blue-500/10"
        : "border-slate-200 bg-slate-50 text-slate-700 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-blue-100";

    const labelTheme = isDarkMode
        ? "text-slate-200"
        : "text-slate-700";

    const mutedTheme = isDarkMode
        ? "text-slate-500"
        : "text-slate-400";

    const selectTheme = isDarkMode
        ? "border-slate-700 bg-slate-800 text-slate-100 hover:border-slate-600 focus:border-blue-500 focus:ring-blue-500/10"
        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-100";

    const sectionBorder = isDarkMode
        ? "border-slate-800"
        : "border-slate-100";

    const currentFileTheme = isDarkMode
        ? "border-slate-800 bg-slate-800/60"
        : "border-slate-200 bg-slate-50";

    const secondaryButtonTheme = isDarkMode
        ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
        : "bg-slate-100 text-slate-600 hover:bg-slate-200";

    useEffect(() => {
        const loadNote = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await API.get(
                    `notes/${id}/`
                );

                const note = response.data;

                setTitle(note.title || "");

                setEducationLevel(
                    note.education_level ||
                        "university"
                );

                setDepartment(
                    note.department || ""
                );

                setClassLevel(
                    note.class_level || ""
                );

                setSubject(
                    note.subject || ""
                );

                setChapter(
                    note.chapter || ""
                );

                setBoard(
                    note.board || ""
                );

                setSemester(
                    note.semester || ""
                );

                setCourse(
                    note.course || ""
                );

                setDescription(
                    note.description || ""
                );

                setOldFile(
                    note.file || ""
                );
            } catch (err) {
                console.error(
                    "Edit Note Load Error:",
                    err
                );

                setError(
                    err.response?.data?.detail ||
                        "Failed to load this note."
                );
            } finally {
                setLoading(false);
            }
        };

        loadNote();
    }, [id]);

    const handleEducationLevelChange = (level) => {
        setEducationLevel(level);
        setError("");

        if (level === "school") {
            setDepartment("");
            setSemester("");
            setCourse("");
        }

        if (level === "university") {
            setClassLevel("");
            setBoard("");
            setChapter("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!title.trim()) {
            setError(
                "Please enter a note title."
            );
            return;
        }

        if (educationLevel === "university") {
            if (!department.trim()) {
                setError(
                    "Please select a department."
                );
                return;
            }
        }

        if (educationLevel === "school") {
            if (!classLevel.trim()) {
                setError(
                    "Please select a class."
                );
                return;
            }

            if (!subject.trim()) {
                setError(
                    "Please enter a subject."
                );
                return;
            }
        }

        if (saving) return;

        try {
            setSaving(true);

            const formData = new FormData();

            formData.append(
                "title",
                title.trim()
            );

            formData.append(
                "education_level",
                educationLevel
            );

            formData.append(
                "department",
                educationLevel === "university"
                    ? department
                    : ""
            );

            formData.append(
                "class_level",
                educationLevel === "school"
                    ? classLevel
                    : ""
            );

            formData.append(
                "subject",
                subject.trim()
            );

            formData.append(
                "chapter",
                educationLevel === "school"
                    ? chapter.trim()
                    : ""
            );

            formData.append(
                "board",
                educationLevel === "school"
                    ? board.trim()
                    : ""
            );

            formData.append(
                "semester",
                educationLevel === "university"
                    ? semester
                    : ""
            );

            formData.append(
                "course",
                educationLevel === "university"
                    ? course.trim()
                    : ""
            );

            formData.append(
                "description",
                description.trim()
            );

            if (file) {
                formData.append(
                    "file",
                    file
                );
            }

            await API.put(
                `notes/update/${id}/`,
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                }
            );

            sessionStorage.setItem(
                "noteshare_success",
                "Note updated successfully!"
            );

            window.dispatchEvent(
                new Event("noteshare:success")
            );

            navigate(`/note/${id}`);
        } catch (err) {
            console.error(
                "Update Note Error:",
                err
            );

            if (
                err.response?.status === 401
            ) {
                setToast({
                    type: "error",
                    message:
                        "Please login first.",
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
                        "You do not have permission to edit this note.",
                });
            } else {
                const responseData =
                    err.response?.data;

                const backendMessage =
                    responseData?.detail ||
                    responseData?.error ||
                    responseData?.department?.[0] ||
                    responseData?.class_level?.[0] ||
                    responseData?.subject?.[0];

                setError(
                    backendMessage ||
                        "Failed to update note."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // ERROR
    // =========================================================

    if (
        error &&
        !title &&
        !department &&
        !classLevel
    ) {
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
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    className={`
                        w-full
                        max-w-lg
                        rounded-[30px]
                        border
                        p-10
                        text-center
                        transition-colors
                        duration-300
                        ${mainCard}
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
                            text-2xl
                            font-black
                            ${
                                isDarkMode
                                    ? "text-white"
                                    : "text-slate-800"
                            }
                        `}
                    >
                        Unable to Edit Note
                    </h2>

                    <p
                        className={`
                            mt-3
                            leading-7
                            ${mutedTheme}
                        `}
                    >
                        {error}
                    </p>

                    <button
                        onClick={() =>
                            navigate(
                                `/note/${id}`
                            )
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
                            shadow-blue-500/20
                            transition-all
                            duration-300
                            hover:-translate-y-0.5
                            hover:bg-blue-700
                            hover:shadow-xl
                        "
                    >
                        <ArrowLeft size={18} />
                        Back to Note
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <section className="
            mx-auto
            max-w-5xl
            px-4
            py-6
            sm:px-6
            sm:py-10
        ">

            <Toast
                toast={toast}
                onClose={() => setToast(null)}
            />

            {/* =====================================================
                TOP NAV
            ====================================================== */}

            <button
                onClick={() =>
                    navigate(`/note/${id}`)
                }
                className={`
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
                            ? "border-slate-700 bg-slate-900/90 text-slate-300 hover:border-blue-500/40 hover:text-blue-400"
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

                Back to Note
            </button>

            {/* =====================================================
                MAIN CARD
            ====================================================== */}

            <div
                className={`
                    mt-7
                    overflow-hidden
                    rounded-[34px]
                    border
                    ring-1
                    transition-all
                    duration-300
                    ${mainCard}
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
                            y: [0, 18, 0],
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
                            h-80
                            w-80
                            rounded-full
                            bg-blue-500/15
                            blur-3xl
                        "
                    />

                    <div className="
                        pointer-events-none
                        absolute
                        inset-0
                        opacity-15
                        [background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)]
                        [background-size:36px_36px]
                    " />

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
                                className="
                                    flex
                                    h-20
                                    w-20
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-[24px]
                                    border
                                    border-white/10
                                    bg-white/10
                                    backdrop-blur-xl
                                    shadow-xl
                                    shadow-black/10
                                "
                            >
                                {isSchool ? (
                                    <School size={34} />
                                ) : (
                                    <FileText size={34} />
                                )}
                            </motion.div>

                            <div>
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
                                    text-[10px]
                                    font-black
                                    uppercase
                                    tracking-[0.18em]
                                    text-cyan-100
                                    backdrop-blur-sm
                                ">
                                    <Sparkles size={13} />
                                    Resource Editor
                                </div>

                                <h1 className="
                                    mt-5
                                    text-4xl
                                    font-black
                                    tracking-tight
                                    sm:text-5xl
                                ">
                                    Edit Note
                                </h1>

                                <p className="
                                    mt-3
                                    max-w-2xl
                                    text-sm
                                    leading-7
                                    text-blue-100
                                    sm:text-base
                                ">
                                    Update your academic resource,
                                    refine its information, or replace
                                    the existing file without losing
                                    the current resource.
                                </p>
                            </div>
                        </div>

                        <div className="
                            mt-8
                            flex
                            flex-wrap
                            gap-2
                            border-t
                            border-white/10
                            pt-6
                        ">
                            <span className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-full
                                border
                                border-white/5
                                bg-white/5
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-slate-300
                                backdrop-blur-sm
                            ">
                                <ShieldCheck size={14} />
                                Your resource
                            </span>

                            <span className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-full
                                border
                                border-white/5
                                bg-white/5
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-slate-300
                                backdrop-blur-sm
                            ">
                                <CheckCircle2 size={14} />
                                Academic details stay organized
                            </span>

                            <span className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-full
                                border
                                border-white/5
                                bg-white/5
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-slate-300
                                backdrop-blur-sm
                            ">
                                Keep existing file unless replaced
                            </span>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    FORM
                ================================================== */}

                <form
                    onSubmit={handleSubmit}
                    className={`
                        space-y-8
                        p-6
                        transition-colors
                        duration-300
                        sm:p-9
                        lg:p-12
                        ${pageBg}
                    `}
                >

                    {/* =================================================
                        ERROR
                    ================================================== */}

                    {error && (
                        <motion.div
                            initial={{
                                opacity: 0,
                                y: -8,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            className={`
                                flex
                                items-start
                                gap-3
                                rounded-2xl
                                border
                                px-4
                                py-3.5
                                shadow-sm
                                ${
                                    isDarkMode
                                        ? "border-red-500/20 bg-red-500/10 text-red-300"
                                        : "border-red-100 bg-red-50 text-red-700"
                                }
                            `}
                        >
                            <span
                                className={`
                                    flex
                                    h-6
                                    w-6
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-full
                                    text-xs
                                    font-black
                                    ${
                                        isDarkMode
                                            ? "bg-red-500/15"
                                            : "bg-red-100"
                                    }
                                `}
                            >
                                !
                            </span>

                            <p className="
                                text-sm
                                font-semibold
                                leading-6
                            ">
                                {error}
                            </p>
                        </motion.div>
                    )}

                    {/* =================================================
                        TITLE
                    ================================================== */}

                    <div>
                        <label
                            className={`
                                flex
                                items-center
                                gap-2
                                text-sm
                                font-bold
                                ${labelTheme}
                            `}
                        >
                            <FileText
                                size={17}
                                className="
                                    text-blue-600
                                "
                            />
                            Note Title
                        </label>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) => {
                                setTitle(
                                    e.target.value
                                );
                                setError("");
                            }}
                            placeholder="Enter note title..."
                            disabled={
                                saving || loading
                            }
                            required
                            className={`
                                mt-3
                                h-14
                                w-full
                                rounded-2xl
                                border
                                px-5
                                shadow-sm
                                outline-none
                                transition-all
                                duration-300
                                hover:shadow-md
                                focus:ring-4
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                                ${inputTheme}
                            `}
                        />
                    </div>

                    {/* =================================================
                        EDUCATION LEVEL
                    ================================================== */}

                    <div>
                        <div className="
                            flex
                            items-end
                            justify-between
                            gap-3
                        ">
                            <label
                                className={`
                                    flex
                                    items-center
                                    gap-2
                                    text-sm
                                    font-bold
                                    ${labelTheme}
                                `}
                            >
                                <GraduationCap
                                    size={17}
                                    className="
                                        text-blue-600
                                    "
                                />
                                Education Level
                            </label>

                            <span
                                className={`
                                    text-[10px]
                                    font-semibold
                                    ${mutedTheme}
                                `}
                            >
                                Choose the academic structure
                            </span>
                        </div>

                        <div className="
                            mt-3
                            grid
                            gap-3
                            sm:grid-cols-2
                        ">

                            {/* UNIVERSITY */}

                            <button
                                type="button"
                                onClick={() =>
                                    handleEducationLevelChange(
                                        "university"
                                    )
                                }
                                disabled={
                                    saving || loading
                                }
                                className={`
                                    group
                                    relative
                                    overflow-hidden
                                    rounded-[22px]
                                    border
                                    p-4
                                    text-left
                                    transition-all
                                    duration-300
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                    ${
                                        educationLevel ===
                                        "university"
                                            ? isDarkMode
                                                ? "border-blue-500/50 bg-blue-500/10 shadow-md shadow-blue-500/5"
                                                : "border-blue-500 bg-blue-50 shadow-md shadow-blue-500/10"
                                            : isDarkMode
                                                ? "border-slate-700 bg-slate-800/60 hover:-translate-y-0.5 hover:border-blue-500/30 hover:bg-blue-500/5 hover:shadow-md"
                                                : "border-slate-200 bg-slate-50/70 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-md"
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
                                            h-11
                                            w-11
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl
                                            transition-all
                                            duration-300
                                            ${
                                                educationLevel ===
                                                "university"
                                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                                    : isDarkMode
                                                        ? "bg-slate-700 text-slate-300"
                                                        : "bg-white text-slate-500"
                                            }
                                        `}
                                    >
                                        <GraduationCap size={20} />
                                    </div>

                                    <div>
                                        <p
                                            className={`
                                                text-sm
                                                font-black
                                                ${
                                                    isDarkMode
                                                        ? "text-slate-100"
                                                        : "text-slate-800"
                                                }
                                            `}
                                        >
                                            University
                                        </p>

                                        <p
                                            className={`
                                                mt-0.5
                                                text-xs
                                                ${mutedTheme}
                                            `}
                                        >
                                            Department, semester & course
                                        </p>
                                    </div>

                                    {educationLevel ===
                                        "university" && (
                                        <CheckCircle2
                                            size={18}
                                            className="
                                                ml-auto
                                                shrink-0
                                                text-blue-600
                                            "
                                        />
                                    )}
                                </div>
                            </button>

                            {/* SCHOOL */}

                            <button
                                type="button"
                                onClick={() =>
                                    handleEducationLevelChange(
                                        "school"
                                    )
                                }
                                disabled={
                                    saving || loading
                                }
                                className={`
                                    group
                                    relative
                                    overflow-hidden
                                    rounded-[22px]
                                    border
                                    p-4
                                    text-left
                                    transition-all
                                    duration-300
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                    ${
                                        educationLevel ===
                                        "school"
                                            ? isDarkMode
                                                ? "border-cyan-500/50 bg-cyan-500/10 shadow-md shadow-cyan-500/5"
                                                : "border-cyan-500 bg-cyan-50 shadow-md shadow-cyan-500/10"
                                            : isDarkMode
                                                ? "border-slate-700 bg-slate-800/60 hover:-translate-y-0.5 hover:border-cyan-500/30 hover:bg-cyan-500/5 hover:shadow-md"
                                                : "border-slate-200 bg-slate-50/70 hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50/40 hover:shadow-md"
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
                                            h-11
                                            w-11
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl
                                            transition-all
                                            duration-300
                                            ${
                                                educationLevel ===
                                                "school"
                                                    ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/20"
                                                    : isDarkMode
                                                        ? "bg-slate-700 text-slate-300"
                                                        : "bg-white text-slate-500"
                                            }
                                        `}
                                    >
                                        <School size={20} />
                                    </div>

                                    <div>
                                        <p
                                            className={`
                                                text-sm
                                                font-black
                                                ${
                                                    isDarkMode
                                                        ? "text-slate-100"
                                                        : "text-slate-800"
                                                }
                                            `}
                                        >
                                            School / College
                                        </p>

                                        <p
                                            className={`
                                                mt-0.5
                                                text-xs
                                                ${mutedTheme}
                                            `}
                                        >
                                            Class, board, subject & chapter
                                        </p>
                                    </div>

                                    {educationLevel ===
                                        "school" && (
                                        <CheckCircle2
                                            size={18}
                                            className="
                                                ml-auto
                                                shrink-0
                                                text-cyan-600
                                            "
                                        />
                                    )}
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* =================================================
                        UNIVERSITY INFORMATION
                    ================================================== */}

                    {!isSchool ? (
                        <motion.div
                            initial={{
                                opacity: 0,
                                y: 8,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            className={`
                                rounded-[28px]
                                border
                                p-5
                                shadow-sm
                                transition-colors
                                duration-300
                                sm:p-6
                                ${
                                    isDarkMode
                                        ? "border-blue-500/15 bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 shadow-none"
                                        : "border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50"
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
                                    rounded-xl
                                    bg-blue-600
                                    text-white
                                    shadow-lg
                                    shadow-blue-500/20
                                ">
                                    <GraduationCap size={21} />
                                </div>

                                <div>
                                    <p className="
                                        text-[10px]
                                        font-black
                                        uppercase
                                        tracking-[0.16em]
                                        text-blue-600
                                    ">
                                        University Resource
                                    </p>

                                    <h3
                                        className={`
                                            mt-1
                                            text-lg
                                            font-black
                                            ${
                                                isDarkMode
                                                    ? "text-white"
                                                    : "text-slate-800"
                                            }
                                        `}
                                    >
                                        Academic Information
                                    </h3>

                                    <p
                                        className={`
                                            mt-1
                                            text-xs
                                            leading-5
                                            ${mutedTheme}
                                        `}
                                    >
                                        Keep this resource connected
                                        to the right university context.
                                    </p>
                                </div>
                            </div>

                            <div className="
                                mt-6
                                grid
                                gap-5
                                md:grid-cols-2
                            ">

                                <div>
                                    <label
                                        className={`
                                            flex
                                            items-center
                                            gap-2
                                            text-sm
                                            font-bold
                                            ${labelTheme}
                                        `}
                                    >
                                        <BookOpen
                                            size={17}
                                            className="
                                                text-blue-600
                                            "
                                        />
                                        Department
                                        <span className="text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        value={
                                            department
                                        }
                                        onChange={(e) => {
                                            setDepartment(
                                                e.target.value
                                            );
                                            setError("");
                                        }}
                                        disabled={
                                            saving ||
                                            loading
                                        }
                                        required
                                        className={`
                                            mt-3
                                            h-14
                                            w-full
                                            appearance-none
                                            rounded-2xl
                                            border
                                            px-5
                                            shadow-sm
                                            outline-none
                                            transition-all
                                            duration-300
                                            hover:shadow-md
                                            focus:ring-4
                                            ${selectTheme}
                                        `}
                                    >
                                        <option value="">
                                            Select Department
                                        </option>

                                        <option value="CSE">CSE</option>
                                        <option value="EEE">EEE</option>
                                        <option value="Civil">
                                            Civil
                                        </option>
                                        <option value="Architecture">
                                            Architecture
                                        </option>
                                        <option value="Textile">
                                            Textile
                                        </option>
                                        <option value="BBA">BBA</option>
                                        <option value="English">
                                            English
                                        </option>
                                        <option value="Law">Law</option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        className={`
                                            flex
                                            items-center
                                            gap-2
                                            text-sm
                                            font-bold
                                            ${labelTheme}
                                        `}
                                    >
                                        <Layers3
                                            size={17}
                                            className="
                                                text-blue-600
                                            "
                                        />
                                        Semester
                                    </label>

                                    <select
                                        value={
                                            semester
                                        }
                                        onChange={(e) => {
                                            setSemester(
                                                e.target.value
                                            );
                                            setError("");
                                        }}
                                        disabled={
                                            saving ||
                                            loading
                                        }
                                        className={`
                                            mt-3
                                            h-14
                                            w-full
                                            appearance-none
                                            rounded-2xl
                                            border
                                            px-5
                                            shadow-sm
                                            outline-none
                                            transition-all
                                            duration-300
                                            hover:shadow-md
                                            focus:ring-4
                                            ${selectTheme}
                                        `}
                                    >
                                        <option value="">
                                            Select Semester
                                        </option>

                                        <option value="1st Semester">
                                            1st Semester
                                        </option>
                                        <option value="2nd Semester">
                                            2nd Semester
                                        </option>
                                        <option value="3rd Semester">
                                            3rd Semester
                                        </option>
                                        <option value="4th Semester">
                                            4th Semester
                                        </option>
                                        <option value="5th Semester">
                                            5th Semester
                                        </option>
                                        <option value="6th Semester">
                                            6th Semester
                                        </option>
                                        <option value="7th Semester">
                                            7th Semester
                                        </option>
                                        <option value="8th Semester">
                                            8th Semester
                                        </option>
                                    </select>
                                </div>

                                <div className="
                                    md:col-span-2
                                ">
                                    <label
                                        className={`
                                            flex
                                            items-center
                                            gap-2
                                            text-sm
                                            font-bold
                                            ${labelTheme}
                                        `}
                                    >
                                        <FileText
                                            size={17}
                                            className="
                                                text-blue-600
                                            "
                                        />
                                        Course / Subject
                                    </label>

                                    <input
                                        type="text"
                                        value={course}
                                        onChange={(e) => {
                                            setCourse(
                                                e.target.value
                                            );
                                            setError("");
                                        }}
                                        placeholder="e.g. Data Structures, Database Management..."
                                        disabled={
                                            saving ||
                                            loading
                                        }
                                        className={`
                                            mt-3
                                            h-14
                                            w-full
                                            rounded-2xl
                                            border
                                            px-5
                                            shadow-sm
                                            outline-none
                                            transition-all
                                            duration-300
                                            hover:shadow-md
                                            focus:ring-4
                                            ${inputTheme}
                                        `}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{
                                opacity: 0,
                                y: 8,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            className={`
                                rounded-[28px]
                                border
                                p-5
                                shadow-sm
                                transition-colors
                                duration-300
                                sm:p-6
                                ${
                                    isDarkMode
                                        ? "border-cyan-500/15 bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 shadow-none"
                                        : "border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-blue-50"
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
                                    rounded-xl
                                    bg-cyan-600
                                    text-white
                                    shadow-lg
                                    shadow-cyan-500/20
                                ">
                                    <School size={21} />
                                </div>

                                <div>
                                    <p className="
                                        text-[10px]
                                        font-black
                                        uppercase
                                        tracking-[0.16em]
                                        text-cyan-600
                                    ">
                                        School / College Resource
                                    </p>

                                    <h3
                                        className={`
                                            mt-1
                                            text-lg
                                            font-black
                                            ${
                                                isDarkMode
                                                    ? "text-white"
                                                    : "text-slate-800"
                                            }
                                        `}
                                    >
                                        Academic Information
                                    </h3>

                                    <p
                                        className={`
                                            mt-1
                                            text-xs
                                            leading-5
                                            ${mutedTheme}
                                        `}
                                    >
                                        Match this resource with the
                                        correct class, board and subject.
                                    </p>
                                </div>
                            </div>

                            <div className="
                                mt-6
                                grid
                                gap-5
                                md:grid-cols-2
                            ">

                                <div>
                                    <label
                                        className={`
                                            flex
                                            items-center
                                            gap-2
                                            text-sm
                                            font-bold
                                            ${labelTheme}
                                        `}
                                    >
                                        <School
                                            size={17}
                                            className="
                                                text-cyan-600
                                            "
                                        />
                                        Class
                                        <span className="text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        value={
                                            classLevel
                                        }
                                        onChange={(e) => {
                                            setClassLevel(
                                                e.target.value
                                            );
                                            setError("");
                                        }}
                                        disabled={
                                            saving ||
                                            loading
                                        }
                                        required
                                        className={`
                                            mt-3
                                            h-14
                                            w-full
                                            appearance-none
                                            rounded-2xl
                                            border
                                            px-5
                                            shadow-sm
                                            outline-none
                                            transition-all
                                            duration-300
                                            hover:shadow-md
                                            focus:border-cyan-500
                                            focus:ring-4
                                            ${
                                                isDarkMode
                                                    ? "border-slate-700 bg-slate-800 text-slate-100 hover:border-slate-600 focus:ring-cyan-500/10"
                                                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 focus:ring-cyan-100"
                                            }
                                        `}
                                    >
                                        <option value="">
                                            Select Class
                                        </option>

                                        {Array.from(
                                            { length: 12 },
                                            (_, index) => (
                                                <option
                                                    key={
                                                        index +
                                                        1
                                                    }
                                                    value={`Class ${
                                                        index +
                                                        1
                                                    }`}
                                                >
                                                    Class{" "}
                                                    {index + 1}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <label
                                        className={`
                                            flex
                                            items-center
                                            gap-2
                                            text-sm
                                            font-bold
                                            ${labelTheme}
                                        `}
                                    >
                                        <Layers3
                                            size={17}
                                            className="
                                                text-cyan-600
                                            "
                                        />
                                        Board / Curriculum
                                    </label>

                                    <select
                                        value={
                                            board
                                        }
                                        onChange={(e) => {
                                            setBoard(
                                                e.target.value
                                            );
                                            setError("");
                                        }}
                                        disabled={
                                            saving ||
                                            loading
                                        }
                                        className={`
                                            mt-3
                                            h-14
                                            w-full
                                            appearance-none
                                            rounded-2xl
                                            border
                                            px-5
                                            shadow-sm
                                            outline-none
                                            transition-all
                                            duration-300
                                            hover:shadow-md
                                            focus:border-cyan-500
                                            focus:ring-4
                                            ${
                                                isDarkMode
                                                    ? "border-slate-700 bg-slate-800 text-slate-100 hover:border-slate-600 focus:ring-cyan-500/10"
                                                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 focus:ring-cyan-100"
                                            }
                                        `}
                                    >
                                        <option value="">
                                            Select Board / Curriculum
                                        </option>

                                        <option value="NCTB">
                                            NCTB
                                        </option>
                                        <option value="English Version">
                                            English Version
                                        </option>
                                        <option value="Cambridge">
                                            Cambridge
                                        </option>
                                        <option value="Edexcel">
                                            Edexcel
                                        </option>
                                        <option value="Madrasa">
                                            Madrasa
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        className={`
                                            flex
                                            items-center
                                            gap-2
                                            text-sm
                                            font-bold
                                            ${labelTheme}
                                        `}
                                    >
                                        <BookOpen
                                            size={17}
                                            className="
                                                text-cyan-600
                                            "
                                        />
                                        Subject
                                        <span className="text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => {
                                            setSubject(
                                                e.target.value
                                            );
                                            setError("");
                                        }}
                                        placeholder="e.g. Mathematics, Physics, English..."
                                        disabled={
                                            saving ||
                                            loading
                                        }
                                        required
                                        className={`
                                            mt-3
                                            h-14
                                            w-full
                                            rounded-2xl
                                            border
                                            px-5
                                            shadow-sm
                                            outline-none
                                            transition-all
                                            duration-300
                                            hover:shadow-md
                                            focus:border-cyan-500
                                            focus:ring-4
                                            ${
                                                isDarkMode
                                                    ? "border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-500 hover:border-slate-600 focus:ring-cyan-500/10"
                                                    : "border-slate-200 bg-slate-50 text-slate-700 placeholder:text-slate-400 hover:border-slate-300 focus:bg-white focus:ring-cyan-100"
                                            }
                                        `}
                                    />
                                </div>

                                <div>
                                    <label
                                        className={`
                                            flex
                                            items-center
                                            gap-2
                                            text-sm
                                            font-bold
                                            ${labelTheme}
                                        `}
                                    >
                                        <FileText
                                            size={17}
                                            className="
                                                text-cyan-600
                                            "
                                        />
                                        Chapter / Topic
                                    </label>

                                    <input
                                        type="text"
                                        value={chapter}
                                        onChange={(e) => {
                                            setChapter(
                                                e.target.value
                                            );
                                            setError("");
                                        }}
                                        placeholder="e.g. Algebra, Motion, Grammar..."
                                        disabled={
                                            saving ||
                                            loading
                                        }
                                        className={`
                                            mt-3
                                            h-14
                                            w-full
                                            rounded-2xl
                                            border
                                            px-5
                                            shadow-sm
                                            outline-none
                                            transition-all
                                            duration-300
                                            hover:shadow-md
                                            focus:border-cyan-500
                                            focus:ring-4
                                            ${
                                                isDarkMode
                                                    ? "border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-500 hover:border-slate-600 focus:ring-cyan-500/10"
                                                    : "border-slate-200 bg-slate-50 text-slate-700 placeholder:text-slate-400 hover:border-slate-300 focus:bg-white focus:ring-cyan-100"
                                            }
                                        `}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* =================================================
                        DESCRIPTION
                    ================================================== */}

                    <div>
                        <div className="
                            flex
                            items-end
                            justify-between
                            gap-3
                        ">
                            <label
                                className={`
                                    flex
                                    items-center
                                    gap-2
                                    text-sm
                                    font-bold
                                    ${labelTheme}
                                `}
                            >
                                <FileText
                                    size={17}
                                    className="
                                        text-blue-600
                                    "
                                />
                                Description
                            </label>

                            <span
                                className={`
                                    text-[10px]
                                    font-semibold
                                    ${mutedTheme}
                                `}
                            >
                                Update the context students will see
                            </span>
                        </div>

                        <textarea
                            rows={8}
                            value={description}
                            onChange={(e) => {
                                setDescription(
                                    e.target.value
                                );
                                setError("");
                            }}
                            placeholder="Describe what this note contains..."
                            disabled={
                                saving || loading
                            }
                            className={`
                                mt-3
                                w-full
                                resize-none
                                rounded-2xl
                                border
                                px-5
                                py-4
                                leading-7
                                shadow-sm
                                outline-none
                                transition-all
                                duration-300
                                hover:shadow-md
                                focus:ring-4
                                ${inputTheme}
                            `}
                        />
                    </div>

                    {/* =================================================
                        CURRENT FILE
                    ================================================== */}

                    {oldFile && (
                        <div
                            className={`
                                overflow-hidden
                                rounded-[24px]
                                border
                                shadow-sm
                                transition-colors
                                duration-300
                                ${currentFileTheme}
                            `}
                        >
                            <div className="
                                flex
                                flex-col
                                gap-4
                                p-5
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                            ">
                                <div className="
                                    flex
                                    items-center
                                    gap-3
                                ">
                                    <div
                                        className={`
                                            flex
                                            h-11
                                            w-11
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl
                                            ${
                                                isDarkMode
                                                    ? "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/10"
                                                    : "bg-blue-50 text-blue-600 ring-1 ring-blue-100"
                                            }
                                        `}
                                    >
                                        <Eye size={18} />
                                    </div>

                                    <div>
                                        <p
                                            className={`
                                                text-[10px]
                                                font-black
                                                uppercase
                                                tracking-[0.16em]
                                                ${mutedTheme}
                                            `}
                                        >
                                            Current File
                                        </p>

                                        <p
                                            className={`
                                                mt-1
                                                text-sm
                                                font-bold
                                                ${
                                                    isDarkMode
                                                        ? "text-slate-200"
                                                        : "text-slate-700"
                                                }
                                            `}
                                        >
                                            Existing resource is still active
                                        </p>
                                    </div>
                                </div>

                                <a
                                    href={`${API.defaults.baseURL.replace(
                                        /\/api\/?$/,
                                        ""
                                    )}${oldFile}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`
                                        inline-flex
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-xl
                                        border
                                        px-4
                                        py-2.5
                                        text-sm
                                        font-bold
                                        shadow-sm
                                        transition-all
                                        duration-300
                                        hover:-translate-y-0.5
                                        hover:shadow-md
                                        ${
                                            isDarkMode
                                                ? "border-slate-700 bg-slate-900 text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/10"
                                                : "border-blue-100 bg-white text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                                        }
                                    `}
                                >
                                    <Eye size={16} />
                                    View Current File
                                </a>
                            </div>
                        </div>
                    )}

                    {/* =================================================
                        REPLACE FILE
                    ================================================== */}

                    <div>
                        <div className="
                            flex
                            items-center
                            justify-between
                            gap-3
                        ">
                            <label
                                className={`
                                    flex
                                    items-center
                                    gap-2
                                    text-sm
                                    font-bold
                                    ${labelTheme}
                                `}
                            >
                                <Upload
                                    size={17}
                                    className="
                                        text-blue-600
                                    "
                                />

                                Replace File

                                <span
                                    className={`
                                        font-medium
                                        ${mutedTheme}
                                    `}
                                >
                                    Optional
                                </span>
                            </label>
                        </div>

                        {!file ? (
                            <label
                                className={`
                                    group
                                    mt-3
                                    flex
                                    cursor-pointer
                                    flex-col
                                    items-center
                                    justify-center
                                    rounded-[26px]
                                    border-2
                                    border-dashed
                                    px-6
                                    py-10
                                    text-center
                                    transition-all
                                    duration-300
                                    hover:shadow-md
                                    ${
                                        isDarkMode
                                            ? "border-slate-700 bg-slate-800/40 hover:border-blue-500/40 hover:bg-blue-500/5 hover:shadow-lg"
                                            : "border-slate-300 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40"
                                    }
                                `}
                            >
                                <div
                                    className={`
                                        flex
                                        h-14
                                        w-14
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        shadow-sm
                                        transition-transform
                                        duration-300
                                        group-hover:scale-105
                                        ${
                                            isDarkMode
                                                ? "bg-slate-700 text-blue-400 ring-1 ring-slate-600"
                                                : "bg-white text-blue-600 ring-1 ring-slate-100"
                                        }
                                    `}
                                >
                                    <Upload size={24} />
                                </div>

                                <h3
                                    className={`
                                        mt-4
                                        text-sm
                                        font-black
                                        ${
                                            isDarkMode
                                                ? "text-slate-200"
                                                : "text-slate-700"
                                        }
                                    `}
                                >
                                    Choose a replacement file
                                </h3>

                                <p
                                    className={`
                                        mt-1
                                        text-xs
                                        leading-5
                                        ${mutedTheme}
                                    `}
                                >
                                    Leave this untouched to keep the current file.
                                </p>

                                <input
                                    type="file"
                                    onChange={(e) =>
                                        setFile(
                                            e.target
                                                .files?.[0] ||
                                                null
                                        )
                                    }
                                    disabled={saving}
                                    className="hidden"
                                />
                            </label>
                        ) : (
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    y: 8,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                className={`
                                    mt-3
                                    rounded-[24px]
                                    border
                                    p-5
                                    shadow-sm
                                    ${
                                        isDarkMode
                                            ? "border-emerald-500/15 bg-emerald-500/10"
                                            : "border-emerald-100 bg-emerald-50"
                                    }
                                `}
                            >
                                <div className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-4
                                ">
                                    <div className="
                                        flex
                                        min-w-0
                                        items-center
                                        gap-3
                                    ">
                                        <div
                                            className={`
                                                flex
                                                h-11
                                                w-11
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-xl
                                                ${
                                                    isDarkMode
                                                        ? "bg-emerald-500/10 text-emerald-400"
                                                        : "bg-emerald-100 text-emerald-600"
                                                }
                                            `}
                                        >
                                            <CheckCircle2
                                                size={21}
                                            />
                                        </div>

                                        <div className="min-w-0">
                                            <p
                                                className={`
                                                    text-[10px]
                                                    font-black
                                                    uppercase
                                                    tracking-[0.16em]
                                                    ${
                                                        isDarkMode
                                                            ? "text-emerald-400"
                                                            : "text-emerald-600"
                                                    }
                                                `}
                                            >
                                                New File Selected
                                            </p>

                                            <p
                                                className={`
                                                    mt-1
                                                    truncate
                                                    text-sm
                                                    font-bold
                                                    ${
                                                        isDarkMode
                                                            ? "text-slate-200"
                                                            : "text-slate-700"
                                                    }
                                                `}
                                            >
                                                {file.name}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFile(
                                                null
                                            )
                                        }
                                        disabled={saving}
                                        className={`
                                            rounded-xl
                                            px-3
                                            py-2
                                            text-xs
                                            font-bold
                                            shadow-sm
                                            transition-all
                                            duration-300
                                            hover:bg-red-50
                                            hover:text-red-600
                                            disabled:opacity-50
                                            ${
                                                isDarkMode
                                                    ? "bg-slate-900 text-slate-300 hover:bg-red-500/10 hover:text-red-400"
                                                    : "bg-white text-slate-500"
                                            }
                                        `}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* =================================================
                        ACTIONS
                    ================================================== */}

                    <div
                        className={`
                            flex
                            flex-col-reverse
                            gap-3
                            border-t
                            pt-6
                            sm:flex-row
                            sm:justify-end
                            ${sectionBorder}
                        `}
                    >
                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    `/note/${id}`
                                )
                            }
                            disabled={saving}
                            className={`
                                rounded-xl
                                px-5
                                py-3.5
                                font-bold
                                transition-all
                                duration-300
                                hover:-translate-y-0.5
                                hover:shadow-sm
                                disabled:opacity-50
                                ${secondaryButtonTheme}
                            `}
                        >
                            Cancel
                        </button>

                        <motion.button
                            type="submit"
                            disabled={
                                saving || loading
                            }
                            whileHover={
                                !saving && !loading
                                    ? {
                                          y: -2,
                                      }
                                    : {}
                            }
                            whileTap={{
                                scale: 0.99,
                            }}
                            className="
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-gradient-to-r
                                from-blue-600
                                to-cyan-500
                                px-7
                                py-3.5
                                font-black
                                text-white
                                shadow-lg
                                shadow-blue-500/15
                                transition-all
                                duration-300
                                hover:from-blue-700
                                hover:to-cyan-600
                                hover:shadow-xl
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            {saving ? (
                                <>
                                    <Loader2
                                        size={18}
                                        className="animate-spin"
                                    />
                                    Saving Changes...
                                </>
                            ) : loading ? (
                                <>
                                    <Loader2
                                        size={18}
                                        className="animate-spin"
                                    />
                                    Loading Note...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Changes
                                </>
                            )}
                        </motion.button>
                    </div>
                </form>
            </div>
        </section>
    );
}

export default EditNote;