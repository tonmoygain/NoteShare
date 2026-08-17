import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

import {
    CalendarDays,
    Eye,
    Pencil,
    Trash2,
    User,
    ArrowLeft,
    Share2,
    Copy,
    Check,
    Loader2,
    Sparkles,
    ArrowUpRight,
    BookOpen,
} from "lucide-react";

function BlogDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");

                const blogRes = await API.get(`blogs/${id}/`);

                console.log(
                    "BLOG DATA JSON:",
                    JSON.stringify(blogRes.data, null, 2)
                );

                setBlog(blogRes.data);
            } catch (err) {
                console.error("Blog Details Error:", err);

                setError(
                    err.response?.data?.detail ||
                        "Failed to load blog details."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const isOwner = useMemo(() => {
        if (!blog) return false;

        const currentUsername =
            localStorage.getItem("username");

        const blogAuthorUsername =
            blog.author?.username ||
            blog.author_username ||
            blog.author_name ||
            "";

        return (
            !!currentUsername &&
            !!blogAuthorUsername &&
            currentUsername === blogAuthorUsername
        );
    }, [blog]);

    const handleDelete = async () => {
        if (!blog || deleting) return;

        const confirmed = window.confirm(
            "Are you sure you want to delete this blog?"
        );

        if (!confirmed) return;

        try {
            setDeleting(true);

            await API.delete(
                `blogs/delete/${blog.id}/`
            );

            alert("Blog deleted successfully.");

            navigate("/blogs");
        } catch (err) {
            console.error("Delete Blog Error:", err);

            if (err.response?.status === 401) {
                alert("Please login first.");
                navigate("/login");
            } else if (err.response?.status === 403) {
                alert(
                    "You do not have permission to delete this blog."
                );
            } else {
                alert(
                    err.response?.data?.detail ||
                        "Failed to delete the blog."
                );
            }
        } finally {
            setDeleting(false);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: blog?.title || "NoteShare Blog",
            text: `Check out this blog on NoteShare: ${
                blog?.title || ""
            }`,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(
                    window.location.href
                );

                setCopied(true);

                setTimeout(() => {
                    setCopied(false);
                }, 2000);
            }
        } catch (err) {
            console.log(
                "Share cancelled or failed:",
                err
            );
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(
                window.location.href
            );

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (err) {
            console.error(
                "Copy Link Error:",
                err
            );

            alert(
                "Could not copy the link. Please copy it manually."
            );
        }
    };

    if (loading) {
        return (
            <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
                <div className="animate-pulse">
                    <div className="h-5 w-28 rounded-full bg-slate-200" />

                    <div className="mt-7 overflow-hidden rounded-[34px] border border-slate-200 bg-white">
                        <div className="h-[280px] bg-gradient-to-br from-slate-300 via-slate-200 to-slate-300 sm:h-[380px]" />

                        <div className="space-y-5 p-7 sm:p-10">
                            <div className="h-10 w-4/5 rounded-xl bg-slate-200" />
                            <div className="h-10 w-2/3 rounded-xl bg-slate-200" />

                            <div className="flex flex-wrap gap-3">
                                <div className="h-12 w-36 rounded-xl bg-slate-200" />
                                <div className="h-12 w-40 rounded-xl bg-slate-200" />
                                <div className="h-12 w-28 rounded-xl bg-slate-200" />
                            </div>

                            <div className="h-28 rounded-3xl bg-slate-100" />

                            <div className="space-y-3">
                                <div className="h-4 rounded bg-slate-200" />
                                <div className="h-4 rounded bg-slate-200" />
                                <div className="h-4 w-5/6 rounded bg-slate-200" />
                                <div className="h-4 w-4/5 rounded bg-slate-200" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (error || !blog) {
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
                        <Eye size={28} />
                    </div>

                    <h2 className="mt-6 text-3xl font-black text-slate-800">
                        Blog Not Found
                    </h2>

                    <p className="mt-3 leading-7 text-slate-500">
                        {error ||
                            "The blog you are looking for does not exist or is no longer available."}
                    </p>

                    <button
                        onClick={() =>
                            navigate("/blogs")
                        }
                        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/15"
                    >
                        <ArrowLeft size={18} />
                        Back to Blogs
                    </button>
                </motion.div>
            </div>
        );
    }

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
                transition={{
                    duration: 0.35,
                }}
                onClick={() =>
                    navigate("/blogs")
                }
                className="
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
                Back to Blogs
            </motion.button>

            {/* =====================================================
                ARTICLE
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
                    HERO IMAGE
                ================================================== */}

                <div className="relative h-[300px] overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-700 sm:h-[420px] lg:h-[470px]">

                    {blog.image ? (
                        <motion.img
                            initial={{
                                scale: 1.04,
                            }}
                            animate={{
                                scale: 1,
                            }}
                            transition={{
                                duration: 1,
                                ease: "easeOut",
                            }}
                            src={blog.image}
                            alt={blog.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <motion.div
                                animate={{
                                    y: [0, -5, 0],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="
                                    flex
                                    h-32
                                    w-32
                                    items-center
                                    justify-center
                                    rounded-full
                                    border
                                    border-white/15
                                    bg-white/10
                                    text-white
                                    shadow-2xl
                                    backdrop-blur-xl
                                "
                            >
                                <BookOpen size={48} />
                            </motion.div>
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />

                    <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl" />

                    <div className="pointer-events-none absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />

                    {/* Views */}

                    <div className="absolute right-5 top-5 sm:right-7 sm:top-7">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm font-bold text-white shadow-lg backdrop-blur-xl">
                            <Eye size={16} />
                            {blog.views || 0} Views
                        </div>
                    </div>

                    {/* Category */}

                    <div className="absolute bottom-6 left-5 sm:bottom-7 sm:left-7">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg">
                            <Sparkles size={14} />
                            Academic Blog
                        </span>
                    </div>
                </div>

                {/* =================================================
                    CONTENT
                ================================================== */}

                <div className="p-6 sm:p-9 lg:p-12">

                    {/* Title */}

                    <h1 className="max-w-5xl text-4xl font-black leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                        {blog.title}
                    </h1>

                    {/* Meta */}

                    <div className="mt-7 flex flex-wrap gap-3">
                        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                            <User
                                size={17}
                                className="text-blue-600"
                            />

                            <span className="font-semibold text-slate-700">
                                {blog.author_name ||
                                    "Unknown"}
                            </span>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                            <CalendarDays
                                size={17}
                                className="text-blue-600"
                            />

                            <span className="text-slate-600">
                                {blog.created_at
                                    ? new Date(
                                          blog.created_at
                                      ).toLocaleDateString(
                                          undefined,
                                          {
                                              year: "numeric",
                                              month: "long",
                                              day: "numeric",
                                          }
                                      )
                                    : "Unknown date"}
                            </span>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                            <Eye
                                size={17}
                                className="text-blue-600"
                            />

                            <span className="text-slate-600">
                                {blog.views || 0} views
                            </span>
                        </div>
                    </div>

                    {/* =================================================
                        AUTHOR CARD
                    ================================================== */}

                    <motion.div
                        whileHover={{
                            y: -2,
                        }}
                        className="
                            mt-9
                            flex
                            flex-col
                            gap-5
                            rounded-[26px]
                            border
                            border-slate-200
                            bg-gradient-to-br
                            from-slate-50
                            via-white
                            to-blue-50/60
                            p-5
                            shadow-sm
                            sm:p-6
                            md:flex-row
                            md:items-center
                            md:justify-between
                        "
                    >
                        <div className="flex items-center gap-4">
                            <div className="
                                flex
                                h-14
                                w-14
                                shrink-0
                                items-center
                                justify-center
                                rounded-2xl
                                bg-gradient-to-br
                                from-blue-600
                                to-cyan-500
                                text-xl
                                font-black
                                text-white
                                shadow-lg
                                shadow-blue-500/15
                            ">
                                {(
                                    blog.author_name ||
                                    "Student"
                                )
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
                                    Written by
                                </p>

                                <h3 className="mt-1 text-lg font-black text-slate-800">
                                    {blog.author_name ||
                                        "Unknown"}
                                </h3>
                            </div>
                        </div>

                        <div className="md:text-right">
                            <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
                                Published
                            </p>

                            <p className="mt-1 font-bold text-slate-700">
                                {blog.created_at
                                    ? new Date(
                                          blog.created_at
                                      ).toLocaleDateString(
                                          undefined,
                                          {
                                              year: "numeric",
                                              month: "short",
                                              day: "numeric",
                                          }
                                      )
                                    : "Unknown"}
                            </p>
                        </div>
                    </motion.div>

                    {/* =================================================
                        ARTICLE CONTENT
                    ================================================== */}

                    <div className="mt-10">
                        <div className="flex items-center gap-2">
                            <div className="h-7 w-1 rounded-full bg-gradient-to-b from-blue-600 to-cyan-400" />

                            <h2 className="text-2xl font-black text-slate-800 sm:text-3xl">
                                Article
                            </h2>
                        </div>

                        <div className="
                            mt-5
                            rounded-[26px]
                            border
                            border-slate-200/80
                            bg-slate-50/70
                            p-6
                            sm:p-8
                            lg:p-10
                        ">
                            <p className="
                                whitespace-pre-line
                                text-[17px]
                                leading-8
                                text-slate-700
                                sm:text-lg
                                sm:leading-9
                            ">
                                {blog.content ||
                                    "No content provided."}
                            </p>
                        </div>
                    </div>

                    {/* =================================================
                        SHARE ACTIONS
                    ================================================== */}

                    <div className="mt-10 grid gap-3 sm:grid-cols-2">
                        <motion.button
                            whileHover={{
                                y: -2,
                            }}
                            whileTap={{
                                scale: 0.99,
                            }}
                            onClick={handleShare}
                            className="
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-blue-600
                                px-5
                                py-3.5
                                font-bold
                                text-white
                                shadow-lg
                                shadow-blue-500/15
                                transition
                                hover:bg-blue-700
                            "
                        >
                            <Share2 size={18} />
                            Share Article
                        </motion.button>

                        <motion.button
                            whileHover={{
                                y: -2,
                            }}
                            whileTap={{
                                scale: 0.99,
                            }}
                            onClick={handleCopyLink}
                            className="
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                px-5
                                py-3.5
                                font-bold
                                text-slate-700
                                transition
                                hover:border-blue-200
                                hover:bg-blue-50/50
                                hover:text-blue-600
                            "
                        >
                            {copied ? (
                                <>
                                    <Check
                                        size={18}
                                        className="text-emerald-500"
                                    />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Copy size={18} />
                                    Copy Link
                                </>
                            )}
                        </motion.button>
                    </div>

                    {/* =================================================
                        OWNER ACTIONS
                    ================================================== */}

                    {isOwner && (
                        <motion.div
                            initial={{
                                opacity: 0,
                                y: 10,
                            }}
                            whileInView={{
                                opacity: 1,
                                y: 0,
                            }}
                            viewport={{
                                once: true,
                            }}
                            className="
                                mt-8
                                rounded-[26px]
                                border
                                border-amber-100
                                bg-gradient-to-br
                                from-amber-50
                                to-red-50/50
                                p-6
                            "
                        >
                            <div className="flex items-center gap-2">
                                <Pencil
                                    size={16}
                                    className="text-amber-600"
                                />

                                <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">
                                    Manage your blog
                                </p>
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <button
                                    onClick={() =>
                                        navigate(
                                            `/edit-blog/${blog.id}`
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
                                    Edit Blog
                                </button>

                                <button
                                    onClick={handleDelete}
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
                                            Delete Blog
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* =================================================
                        FOOTER NAVIGATION
                    ================================================== */}

                    <div className="
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
                                navigate("/blogs")
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
                            Back to Blogs
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

export default BlogDetails;