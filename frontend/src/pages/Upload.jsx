import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

import {
    UploadCloud,
    FileText,
    ArrowLeft,
    BookOpen,
    FolderOpen,
    Sparkles,
    X,
    CheckCircle2,
    Loader2,
    ShieldCheck,
} from "lucide-react";

import API from "../services/api";

function Upload() {
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [department, setDepartment] = useState("CSE");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);

    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "image/png",
        "image/jpeg",
    ];

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];

        if (!selectedFile) return;

        setError("");

        if (!allowedTypes.includes(selectedFile.type)) {
            setError(
                "Unsupported file type. Please choose PDF, DOC, DOCX, PPT, PPTX, PNG or JPG."
            );

            e.target.value = "";
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            setError("Maximum file size is 10 MB.");
            e.target.value = "";
            return;
        }

        setFile(selectedFile);
    };

    const removeFile = () => {
        setFile(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (uploading) return;

        setError("");

        if (!title.trim()) {
            setError("Please enter a note title.");
            return;
        }

        if (!department) {
            setError("Please select a department.");
            return;
        }

        if (!description.trim()) {
            setError("Please enter a description.");
            return;
        }

        if (!file) {
            setError("Please select a file to upload.");
            return;
        }

        const token = localStorage.getItem("access");

        if (!token) {
            alert("Please login first to upload a note.");
            navigate("/login");
            return;
        }

        try {
            setUploading(true);

            const formData = new FormData();

            formData.append("title", title.trim());
            formData.append("department", department);
            formData.append("description", description.trim());
            formData.append("file", file);
            formData.append(
                "username",
                localStorage.getItem("username") || ""
            );

            const response = await API.post(
                "notes/create/",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            alert("Note uploaded successfully!");

            if (response.data?.id) {
                navigate(`/note/${response.data.id}`);
            } else {
                navigate("/notes");
            }
        } catch (err) {
            console.error("Upload Note Error:", err);

            if (err.response?.status === 401) {
                alert("Please login first.");
                navigate("/login");
            } else if (err.response?.status === 400) {
                setError(
                    err.response?.data?.detail ||
                        err.response?.data?.error ||
                        JSON.stringify(
                            err.response?.data ||
                                "Invalid upload data."
                        )
                );
            } else {
                setError(
                    err.response?.data?.detail ||
                        err.response?.data?.error ||
                        "Upload failed. Please try again."
                );
            }
        } finally {
            setUploading(false);
        }
    };

    return (
        <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">

            <div
                
                className="
                    upload-page-card
                    overflow-hidden
                    rounded-[34px]
                    border
                    border-slate-200/80
                    bg-white
                    shadow-[0_25px_70px_rgba(15,23,42,0.08)]
                "
            >

                {/* =====================================================
                    HERO
                ====================================================== */}

                <div
                    className="
                        relative
                        overflow-hidden
                        bg-gradient-to-br
                        from-blue-700
                        via-blue-600
                        to-cyan-500
                        px-6
                        py-8
                        text-white
                        sm:px-9
                        sm:py-10
                        lg:px-10
                        lg:py-12
                    "
                >
                    <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

                    <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />

                    <div className="relative">

                        <button
                            type="button"
                            onClick={() => navigate("/notes")}
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-xl
                                border
                                border-white/15
                                bg-white/10
                                px-4
                                py-2.5
                                text-sm
                                font-bold
                                backdrop-blur-sm
                                transition
                                hover:-translate-y-0.5
                                hover:bg-white/15
                            "
                        >
                            <ArrowLeft size={17} />
                            Back to Notes
                        </button>

                        <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center">

                            <motion.div
                                whileHover={{
                                    rotate: -3,
                                    scale: 1.03,
                                }}
                                className="
                                    flex
                                    h-16
                                    w-16
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    border
                                    border-white/15
                                    bg-white/10
                                    shadow-xl
                                    backdrop-blur-sm
                                "
                            >
                                <Sparkles
                                    size={30}
                                    strokeWidth={2}
                                />
                            </motion.div>

                            <div>
                                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-blue-100 backdrop-blur-sm">
                                    <ShieldCheck size={12} />
                                    Share Knowledge
                                </div>

                                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                                    Upload Study Note
                                </h1>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                                    Share useful academic resources with your student community.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* =====================================================
                    FORM
                ====================================================== */}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-8 p-6 sm:p-8 lg:p-10"
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
                                upload-error
                                flex
                                items-start
                                gap-3
                                rounded-2xl
                                border
                                border-red-100
                                bg-red-50
                                px-5
                                py-4
                                text-red-700
                            "
                        >
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-black">
                                !
                            </div>

                            <p className="text-sm font-semibold leading-6">
                                {error}
                            </p>
                        </motion.div>
                    )}

                    {/* =====================================================
                        BASIC INFORMATION
                    ====================================================== */}

                    <div>
                        <div className="mb-5">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-600">
                                Step 01
                            </p>

                            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-800">
                                Basic Information
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                Give your study resource a clear identity.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">

                            {/* Title */}

                            <div className="md:col-span-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                    <BookOpen
                                        size={17}
                                        className="text-blue-600"
                                    />
                                    Note Title
                                </label>

                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) =>
                                        setTitle(e.target.value)
                                    }
                                    placeholder="Operating System Mid Note"
                                    disabled={uploading}
                                    className="
                                        upload-form-control
                                        mt-3
                                        h-14
                                        w-full
                                        rounded-2xl
                                        border
                                        border-slate-200
                                        bg-slate-50/60
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
                                        disabled:bg-slate-100
                                    "
                                />
                            </div>

                            {/* Department */}

                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                    <FolderOpen
                                        size={17}
                                        className="text-blue-600"
                                    />
                                    Department
                                </label>

                                <select
                                    value={department}
                                    onChange={(e) =>
                                        setDepartment(
                                            e.target.value
                                        )
                                    }
                                    disabled={uploading}
                                    className="
                                        upload-form-control
                                        mt-3
                                        h-14
                                        w-full
                                        rounded-2xl
                                        border
                                        border-slate-200
                                        bg-slate-50/60
                                        px-5
                                        text-slate-700
                                        outline-none
                                        transition
                                        focus:border-blue-500
                                        focus:bg-white
                                        focus:ring-4
                                        focus:ring-blue-100
                                        disabled:cursor-not-allowed
                                        disabled:bg-slate-100
                                    "
                                >
                                    <option value="CSE">CSE</option>
                                    <option value="EEE">EEE</option>
                                    <option value="BBA">BBA</option>
                                    <option value="English">
                                        English
                                    </option>
                                    <option value="Law">Law</option>
                                </select>
                            </div>

                            {/* Resource Type Info */}

                            <div
                                className="
                                    upload-resource-info
                                    flex
                                    items-center
                                    gap-3
                                    rounded-2xl
                                    border
                                    border-blue-100
                                    bg-blue-50/70
                                    px-4
                                "
                            >
                                <div className="upload-resource-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                                    <FileText size={18} />
                                </div>

                                <div>
                                    <p className="text-sm font-bold text-slate-700">
                                        Academic Resource
                                    </p>

                                    <p className="mt-0.5 text-xs text-slate-400">
                                        Help others learn from your material.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* =====================================================
                        DESCRIPTION
                    ====================================================== */}

                    <div>
                        <div className="mb-5">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-600">
                                Step 02
                            </p>

                            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-800">
                                Describe Your Note
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                A useful description helps other students find the right resource.
                            </p>
                        </div>

                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                            <FileText
                                size={17}
                                className="text-blue-600"
                            />
                            Description
                        </label>

                        <textarea
                            rows="6"
                            value={description}
                            onChange={(e) =>
                                setDescription(
                                    e.target.value
                                )
                            }
                            placeholder="Write a short description of what this note contains..."
                            disabled={uploading}
                            className="
                                upload-form-control
                                mt-3
                                w-full
                                resize-none
                                rounded-2xl
                                border
                                border-slate-200
                                bg-slate-50/60
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
                                disabled:bg-slate-100
                            "
                        />
                    </div>

                    {/* =====================================================
                        FILE UPLOAD
                    ====================================================== */}

                    <div>
                        <div className="mb-5">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-600">
                                Step 03
                            </p>

                            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-800">
                                Add Your Study File
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                Choose the resource you want to share.
                            </p>
                        </div>

                        {!file ? (
                            <label
                                className="
                                    upload-file-dropzone
                                    group
                                    relative
                                    flex
                                    cursor-pointer
                                    flex-col
                                    items-center
                                    justify-center
                                    overflow-hidden
                                    rounded-[28px]
                                    border
                                    border-dashed
                                    border-blue-300
                                    bg-gradient-to-br
                                    from-blue-50/80
                                    via-white
                                    to-cyan-50/60
                                    px-6
                                    py-12
                                    text-center
                                    transition
                                    duration-300
                                    hover:-translate-y-0.5
                                    hover:border-blue-400
                                    hover:shadow-[0_18px_45px_rgba(37,99,235,0.08)]
                                "
                            >
                                <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-400/10 blur-3xl transition duration-500 group-hover:scale-125" />

                                <motion.div
                                    whileHover={{
                                        y: -3,
                                        scale: 1.03,
                                    }}
                                    className="
                                        relative
                                        flex
                                        h-20
                                        w-20
                                        items-center
                                        justify-center
                                        rounded-3xl
                                        bg-gradient-to-br
                                        from-blue-600
                                        to-cyan-500
                                        text-white
                                        shadow-lg
                                        shadow-blue-500/20
                                    "
                                >
                                    <UploadCloud size={38} />
                                </motion.div>

                                <h2 className="relative mt-6 text-xl font-black text-slate-800 sm:text-2xl">
                                    Choose a Study File
                                </h2>

                                <p className="relative mt-2 text-sm text-slate-500">
                                    PDF, DOC, DOCX, PPT, PPTX, PNG or JPG
                                </p>

                                <p className="relative mt-2 text-xs font-semibold text-slate-400">
                                    Maximum file size: 10 MB
                                </p>

                                <div className="upload-browse-badge relative mt-5 rounded-full bg-white px-4 py-2 text-xs font-bold text-blue-600 shadow-sm">
                                    Click to browse files
                                </div>

                                <input
                                    hidden
                                    type="file"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                />
                            </label>
                        ) : (
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    scale: 0.98,
                                }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                }}
                                className="
                                    upload-selected-file
                                    rounded-[28px]
                                    border
                                    border-blue-100
                                    bg-gradient-to-br
                                    from-blue-50
                                    to-cyan-50/60
                                    p-5
                                    shadow-sm
                                "
                            >
                                <div className="flex items-center justify-between gap-4">

                                    <div className="flex min-w-0 items-center gap-4">
                                        <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/15">
                                            <FileText size={22} />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate font-bold text-slate-800">
                                                {file.name}
                                            </p>

                                            <p className="mt-1 text-sm text-slate-500">
                                                {(
                                                    file.size /
                                                    1024 /
                                                    1024
                                                ).toFixed(2)}{" "}
                                                MB
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={removeFile}
                                        disabled={uploading}
                                        className="
                                            upload-remove-file
                                            flex
                                            h-10
                                            w-10
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl
                                            border
                                            border-slate-200
                                            bg-white
                                            text-slate-500
                                            transition
                                            hover:border-red-200
                                            hover:bg-red-50
                                            hover:text-red-500
                                            disabled:opacity-50
                                        "
                                        title="Remove selected file"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-600">
                                    <CheckCircle2 size={16} />
                                    File ready to upload
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* =====================================================
                        SUBMIT
                    ====================================================== */}

                    <div className="upload-submit-area border-t border-slate-100 pt-7">

                        <div className="mb-5 flex items-center gap-2 text-xs font-semibold text-slate-400">
                            <ShieldCheck
                                size={15}
                                className="text-emerald-500"
                            />

                            Your uploaded resource will be shared with the NoteShare community.
                        </div>

                        <motion.button
                            type="submit"
                            disabled={uploading}
                            whileHover={
                                !uploading
                                    ? {
                                          y: -2,
                                      }
                                    : {}
                            }
                            whileTap={
                                !uploading
                                    ? {
                                          scale: 0.99,
                                      }
                                    : {}
                            }
                            className="
                                w-full
                                rounded-2xl
                                bg-gradient-to-r
                                from-blue-600
                                to-cyan-500
                                py-4
                                text-lg
                                font-black
                                text-white
                                shadow-xl
                                shadow-blue-500/15
                                transition
                                hover:from-blue-700
                                hover:to-cyan-600
                                hover:shadow-2xl
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            <span className="flex items-center justify-center gap-3">
                                {uploading ? (
                                    <>
                                        <Loader2
                                            size={20}
                                            className="animate-spin"
                                        />
                                        Uploading Note...
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud size={20} />
                                        Upload Note
                                    </>
                                )}
                            </span>
                        </motion.button>
                    </div>
                </form>
            </div>
        </section>
    );
}

export default Upload;