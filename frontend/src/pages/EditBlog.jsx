import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useNavigate, useParams } from "react-router-dom";

import {
    FileText,
    Image,
    Send,
    ArrowLeft,
    Pencil,
    Loader2,
    Sparkles,
    CheckCircle2,
    ShieldCheck,
    Eye,
} from "lucide-react";

import API from "../services/api";
import Toast from "../components/Toast";

function EditBlog() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const [error, setError] = useState("");
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const loadBlog = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await API.get(
                    `blogs/${id}/`
                );

                setTitle(
                    response.data.title || ""
                );

                setContent(
                    response.data.content || ""
                );
            } catch (err) {
                console.error(
                    "Edit Blog Load Error:",
                    err
                );

                setError(
                    err.response?.data?.detail ||
                        "Failed to load blog."
                );
            } finally {
                setLoading(false);
            }
        };

        loadBlog();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!title.trim()) {
            setError(
                "Please enter a blog title."
            );
            return;
        }

        if (!content.trim()) {
            setError(
                "Please enter blog content."
            );
            return;
        }

        if (updating) return;

        try {
            setUpdating(true);

            const formData = new FormData();

            formData.append(
                "title",
                title.trim()
            );

            formData.append(
                "content",
                content.trim()
            );

            if (image) {
                formData.append(
                    "image",
                    image
                );
            }

            await API.patch(
                `blogs/update/${id}/`,
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
                "Blog updated successfully!"
            );

            window.dispatchEvent(
                new Event("noteshare:success")
            );

            navigate(`/blog/${id}`);
        } catch (err) {
            console.error(
                "Update Blog Error:",
                err
            );

            if (
                err.response?.status === 401
            ) {
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
                        "You do not have permission to edit this blog.",
                });

            } else {
                setError(
                    err.response?.data?.detail ||
                        err.response?.data?.error ||
                        "Failed to update blog."
                );
            }
        } finally {
            setUpdating(false);
        }
    };


    // =========================================================
    // ERROR
    // =========================================================

    if (error && !title) {
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
                    className="edit-blog-error-card w-full max-w-lg rounded-[30px] border border-slate-200 bg-white p-10 text-center shadow-[0_20px_55px_rgba(15,23,42,0.08)]"
                >
                    <div className="edit-blog-error-icon mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                        <FileText size={28} />
                    </div>

                    <h2 className="mt-6 text-2xl font-black text-slate-800">
                        Unable to Edit Blog
                    </h2>

                    <p className="mt-3 leading-7 text-slate-500">
                        {error}
                    </p>

                    <button
                        onClick={() =>
                            navigate("/blogs")
                        }
                        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg"
                    >
                        <ArrowLeft size={18} />
                        Back to Blogs
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">

            <Toast
                toast={toast}
                onClose={() => setToast(null)}
            />

            {/* =====================================================
                TOP NAV
            ====================================================== */}

            <button
                
                onClick={() =>
                    navigate(`/blog/${id}`)
                }
                className="
                    edit-blog-back
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

                Back to Blog
            </button>

            {/* =====================================================
                MAIN CARD
            ====================================================== */}

            <div
                
                className="
                    edit-blog-card
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
                                <Pencil size={34} />
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
                                    Article Editor
                                </div>

                                <h1 className="
                                    mt-5
                                    text-4xl
                                    font-black
                                    tracking-tight
                                    sm:text-5xl
                                ">
                                    Edit Blog
                                </h1>

                                <p className="
                                    mt-3
                                    max-w-2xl
                                    text-sm
                                    leading-7
                                    text-blue-100
                                    sm:text-base
                                ">
                                    Refine your article, improve
                                    the presentation and keep
                                    your ideas fresh.
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
                                Your article
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
                                Keep your existing image unless replaced
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

                            Blog Title
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
                            placeholder="Enter your blog title..."
                            disabled={updating}
                            required
                            className="
                                edit-blog-control
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
                        CONTENT
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

                                Blog Content
                            </label>

                            <span className="hidden text-[10px] font-semibold text-slate-400 sm:block">
                                Keep your ideas clear and readable
                            </span>
                        </div>

                        <textarea
                            rows={14}
                            value={content}
                            onChange={(e) => {
                                setContent(
                                    e.target.value
                                );
                                setError("");
                            }}
                            placeholder="Write your blog here..."
                            disabled={updating}
                            required
                            className="
                                edit-blog-control
                                mt-3
                                w-full
                                resize-none
                                rounded-[24px]
                                border
                                border-slate-200
                                bg-slate-50/80
                                px-5
                                py-5
                                leading-8
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

                        <div className="
                            mt-2
                            flex
                            justify-end
                            text-[10px]
                            font-medium
                            text-slate-400
                        ">
                            {content.length.toLocaleString()} characters
                        </div>
                    </div>

                    {/* =================================================
                        IMAGE
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
                            <Image
                                size={17}
                                className="text-blue-600"
                            />

                            Replace Cover Image

                            <span className="font-medium text-slate-400">
                                Optional
                            </span>
                        </label>

                        {!image ? (
                            <label className="
                                edit-blog-dropzone
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
                                    edit-blog-upload-icon
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
                                    <Image size={24} />
                                </div>

                                <h3 className="mt-4 text-sm font-black text-slate-700">
                                    Choose a new cover image
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                    Leave this empty to keep the current image.
                                </p>

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setImage(
                                            e.target
                                                .files?.[0] ||
                                                null
                                        )
                                    }
                                    disabled={updating}
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
                                    edit-blog-selected-image
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
                                            <p className="
                                                text-[10px]
                                                font-black
                                                uppercase
                                                tracking-[0.16em]
                                                text-emerald-600
                                            ">
                                                New Image Selected
                                            </p>

                                            <p className="mt-1 truncate text-sm font-bold text-slate-700">
                                                {image.name}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setImage(
                                                null
                                            )
                                        }
                                        disabled={updating}
                                        className="
                                            edit-blog-remove-image
                                            inline-flex
                                            items-center
                                            gap-1.5
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
                        PREVIEW INFO
                    ================================================== */}

                    <div className="
                        edit-blog-preview-info
                        flex
                        items-start
                        gap-3
                        rounded-[22px]
                        border
                        border-blue-100
                        bg-blue-50/70
                        px-5
                        py-4
                    ">
                        <div className="
                            edit-blog-preview-icon
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-white
                            text-blue-600
                            shadow-sm
                        ">
                            <Eye size={17} />
                        </div>

                        <div>
                            <p className="text-sm font-bold text-blue-800">
                                Your changes stay on this article
                            </p>

                            <p className="mt-1 text-xs leading-5 text-blue-600">
                                After saving, you'll return directly
                                to the updated blog.
                            </p>
                        </div>
                    </div>

                    {/* =================================================
                        ACTIONS
                    ================================================== */}

                    <div className="
                        edit-blog-actions
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
                                    `/blog/${id}`
                                )
                            }
                            disabled={updating}
                            className="
                                edit-blog-cancel
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
                            disabled={updating}
                            whileHover={
                                !updating
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
                            {updating ? (
                                <>
                                    <Loader2
                                        size={18}
                                        className="animate-spin"
                                    />
                                    Updating Blog...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Update Blog
                                </>
                            )}
                        </motion.button>
                    </div>
                </form>
            </div>
        </section>
    );
}

export default EditBlog;