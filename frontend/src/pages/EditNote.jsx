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
} from "lucide-react";

import API from "../services/api";

function EditNote() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState("");
    const [department, setDepartment] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);
    const [oldFile, setOldFile] = useState("");

    const [error, setError] = useState("");

    useEffect(() => {
        const loadNote = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await API.get(
                    `notes/${id}/`
                );

                setTitle(
                    response.data.title || ""
                );

                setDepartment(
                    response.data.department || ""
                );

                setDescription(
                    response.data.description || ""
                );

                setOldFile(
                    response.data.file || ""
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!title.trim()) {
            setError(
                "Please enter a note title."
            );
            return;
        }

        if (!department) {
            setError(
                "Please select a department."
            );
            return;
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
                "department",
                department
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
                alert("Please login first.");
                navigate("/login");
            } else if (
                err.response?.status === 403
            ) {
                alert(
                    "You do not have permission to edit this note."
                );
            } else {
                setError(
                    err.response?.data?.detail ||
                        err.response?.data?.error ||
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

    if (error && !title && !department) {
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
                    className="edit-note-error-card w-full max-w-lg rounded-[30px] border border-slate-200 bg-white p-10 text-center shadow-[0_20px_55px_rgba(15,23,42,0.08)]"
                >
                    <div className="edit-note-error-icon mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                        <FileText size={28} />
                    </div>

                    <h2 className="mt-6 text-2xl font-black text-slate-800">
                        Unable to Edit Note
                    </h2>

                    <p className="mt-3 leading-7 text-slate-500">
                        {error}
                    </p>

                    <button
                        onClick={() =>
                            navigate(
                                `/note/${id}`
                            )
                        }
                        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg"
                    >
                        <ArrowLeft size={18} />
                        Back to Note
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">

            {/* =====================================================
                TOP NAV
            ====================================================== */}

            <button
                
                onClick={() =>
                    navigate(`/note/${id}`)
                }
                className="
                    edit-note-back
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

                Back to Note
            </button>

            {/* =====================================================
                MAIN CARD
            ====================================================== */}

            <div
                
                className="
                    edit-note-card
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

                    <div
                        className="
                            pointer-events-none
                            absolute
                            inset-0
                            opacity-15
                            [background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)]
                            [background-size:36px_36px]
                        "
                    />

                    <div className="relative px-6 py-9 sm:px-9 sm:py-12 lg:px-12 lg:py-14">

                        <div className="flex flex-col gap-7 md:flex-row md:items-center">

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
                                "
                            >
                                <FileText size={34} />
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
                                    Update your study resource,
                                    improve the description or replace
                                    the existing file.
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
                                bg-white/5
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-slate-300
                            ">
                                <ShieldCheck size={14} />
                                Your resource
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
                    className="space-y-8 p-6 sm:p-9 lg:p-12"
                >

                    {/* Error */}

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
                            className="
                                edit-note-error
                                flex
                                items-start
                                gap-3
                                rounded-2xl
                                border
                                border-red-100
                                bg-red-50
                                px-4
                                py-3.5
                                text-red-700
                            "
                        >
                            <span className="
                                flex
                                h-6
                                w-6
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-red-100
                                text-xs
                                font-black
                            ">
                                !
                            </span>

                            <p className="text-sm font-semibold leading-6">
                                {error}
                            </p>
                        </motion.div>
                    )}

                    {/* =================================================
                        TITLE
                    ================================================== */}

                    <div>
                        <label className="
                            flex
                            items-center
                            gap-2
                            text-sm
                            font-bold
                            text-slate-700
                        ">
                            <FileText
                                size={17}
                                className="text-blue-600"
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
                            disabled={saving}
                            required
                            className="
                                edit-note-control
                                mt-3
                                h-14
                                w-full
                                rounded-2xl
                                border
                                border-slate-200
                                bg-slate-50/80
                                px-5
                                text-slate-700
                                outline-none
                                transition
                                placeholder:text-slate-400
                                focus:border-blue-500
                                focus:bg-white
                                focus:ring-4
                                focus:ring-blue-100
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        />
                    </div>

                    {/* =================================================
                        DEPARTMENT
                    ================================================== */}

                    <div>
                        <label className="
                            flex
                            items-center
                            gap-2
                            text-sm
                            font-bold
                            text-slate-700
                        ">
                            <BookOpenIcon />
                            Department
                        </label>

                        <select
                            value={department}
                            onChange={(e) => {
                                setDepartment(
                                    e.target.value
                                );
                                setError("");
                            }}
                            disabled={saving}
                            required
                            className="
                                edit-note-control
                                mt-3
                                h-14
                                w-full
                                appearance-none
                                rounded-2xl
                                border
                                border-slate-200
                                bg-slate-50/80
                                px-5
                                text-slate-700
                                outline-none
                                transition
                                focus:border-blue-500
                                focus:bg-white
                                focus:ring-4
                                focus:ring-blue-100
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >
                            <option value="">
                                Select Department
                            </option>

                            <option value="CSE">
                                CSE
                            </option>

                            <option value="EEE">
                                EEE
                            </option>

                            <option value="BBA">
                                BBA
                            </option>

                            <option value="English">
                                English
                            </option>

                            <option value="Law">
                                Law
                            </option>
                        </select>
                    </div>

                    {/* =================================================
                        DESCRIPTION
                    ================================================== */}

                    <div>
                        <div className="flex items-end justify-between gap-3">
                            <label className="
                                flex
                                items-center
                                gap-2
                                text-sm
                                font-bold
                                text-slate-700
                            ">
                                <FileText
                                    size={17}
                                    className="text-blue-600"
                                />
                                Description
                            </label>

                            <span className="text-[10px] font-semibold text-slate-400">
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
                            disabled={saving}
                            className="
                                edit-note-control
                                mt-3
                                w-full
                                resize-none
                                rounded-2xl
                                border
                                border-slate-200
                                bg-slate-50/80
                                px-5
                                py-4
                                leading-7
                                text-slate-700
                                outline-none
                                transition
                                placeholder:text-slate-400
                                focus:border-blue-500
                                focus:bg-white
                                focus:ring-4
                                focus:ring-blue-100
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        />
                    </div>

                    {/* =================================================
                        CURRENT FILE
                    ================================================== */}

                    {oldFile && (
                        <div className="
                            edit-note-current-file
                            overflow-hidden
                            rounded-[24px]
                            border
                            border-slate-200
                            bg-slate-50/70
                        ">
                            <div className="
                                flex
                                flex-col
                                gap-4
                                p-5
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                            ">
                                <div className="flex items-center gap-3">
                                    <div className="
                                        edit-note-file-icon
                                        flex
                                        h-11
                                        w-11
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-blue-50
                                        text-blue-600
                                    ">
                                        <Eye size={18} />
                                    </div>

                                    <div>
                                        <p className="
                                            text-[10px]
                                            font-black
                                            uppercase
                                            tracking-[0.16em]
                                            text-slate-400
                                        ">
                                            Current File
                                        </p>

                                        <p className="mt-1 text-sm font-bold text-slate-700">
                                            Existing resource is still active
                                        </p>
                                    </div>
                                </div>

                                <a
                                    href={`${API.defaults.baseURL.replace(/\/api\/?$/, "")}${oldFile}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="
                                        edit-note-view-file
                                        inline-flex
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-xl
                                        border
                                        border-blue-100
                                        bg-white
                                        px-4
                                        py-2.5
                                        text-sm
                                        font-bold
                                        text-blue-600
                                        shadow-sm
                                        transition
                                        hover:border-blue-200
                                        hover:bg-blue-50
                                    "
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
                        <div className="flex items-center justify-between gap-3">
                            <label className="
                                flex
                                items-center
                                gap-2
                                text-sm
                                font-bold
                                text-slate-700
                            ">
                                <Upload
                                    size={17}
                                    className="text-blue-600"
                                />

                                Replace File

                                <span className="font-medium text-slate-400">
                                    Optional
                                </span>
                            </label>
                        </div>

                        {!file ? (
                            <label className="
                                edit-note-dropzone
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
                                border-slate-300
                                bg-slate-50/60
                                px-6
                                py-10
                                text-center
                                transition
                                hover:border-blue-300
                                hover:bg-blue-50/40
                            ">
                                <div className="
                                    edit-note-upload-icon
                                    flex
                                    h-14
                                    w-14
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-white
                                    text-blue-600
                                    shadow-sm
                                    transition
                                    group-hover:scale-105
                                ">
                                    <Upload size={24} />
                                </div>

                                <h3 className="mt-4 text-sm font-black text-slate-700">
                                    Choose a replacement file
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-slate-400">
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
                                className="
                                    edit-note-selected-file
                                    mt-3
                                    rounded-[24px]
                                    border
                                    border-emerald-100
                                    bg-emerald-50
                                    p-5
                                "
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="
                                            flex
                                            h-11
                                            w-11
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl
                                            bg-emerald-100
                                            text-emerald-600
                                        ">
                                            <CheckCircle2
                                                size={21}
                                            />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">
                                                New File Selected
                                            </p>

                                            <p className="mt-1 truncate text-sm font-bold text-slate-700">
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
                                        className="
                                            edit-note-remove-file
                                            rounded-xl
                                            bg-white
                                            px-3
                                            py-2
                                            text-xs
                                            font-bold
                                            text-slate-500
                                            shadow-sm
                                            transition
                                            hover:bg-red-50
                                            hover:text-red-600
                                            disabled:opacity-50
                                        "
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

                    <div className="
                        edit-note-actions
                        flex
                        flex-col-reverse
                        gap-3
                        border-t
                        border-slate-100
                        pt-6
                        sm:flex-row
                        sm:justify-end
                    ">
                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    `/note/${id}`
                                )
                            }
                            disabled={saving}
                            className="
                                edit-note-cancel
                                rounded-xl
                                bg-slate-100
                                px-5
                                py-3.5
                                font-bold
                                text-slate-600
                                transition
                                hover:bg-slate-200
                                disabled:opacity-50
                            "
                        >
                            Cancel
                        </button>

                        <motion.button
                            type="submit"
                            disabled={saving}
                            whileHover={
                                !saving
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
                                transition
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

function BookOpenIcon() {
    return (
        <BookIconFallback />
    );
}

function BookIconFallback() {
    return (
        <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-600"
        >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
        </svg>
    );
}

export default EditNote;