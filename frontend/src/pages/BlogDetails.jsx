import { useEffect, useMemo, useState } from "react";
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

            await API.delete(`blogs/delete/${blog.id}/`);

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
            text: `Check out this blog on NoteShare: ${blog?.title || ""}`,
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
            console.log("Share cancelled or failed:", err);
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
            console.error("Copy Link Error:", err);

            alert(
                "Could not copy the link. Please copy it manually."
            );
        }
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-6">
                <div className="text-center">
                    <Loader2
                        size={42}
                        className="animate-spin mx-auto text-blue-600"
                    />

                    <p className="mt-5 text-slate-500 font-semibold">
                        Loading Blog...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-6">
                <div className="bg-white border border-slate-100 rounded-[30px] shadow-xl p-10 text-center max-w-lg">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
                        <Eye size={28} />
                    </div>

                    <h2 className="text-3xl font-black text-slate-800 mt-6">
                        Blog Not Found
                    </h2>

                    <p className="text-slate-500 mt-3 leading-7">
                        {error ||
                            "The blog you are looking for does not exist or is no longer available."}
                    </p>

                    <button
                        onClick={() => navigate("/blogs")}
                        className="mt-7 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition"
                    >
                        <ArrowLeft size={18} />
                        Back to Blogs
                    </button>
                </div>
            </div>
        );
    }

    return (
        <section className="max-w-6xl mx-auto px-6 py-10">

            {/* Back Button */}

            <button
                onClick={() => navigate("/blogs")}
                className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold transition"
            >
                <ArrowLeft size={18} />
                Back to Blogs
            </button>


            {/* Main Blog Card */}

            <article className="mt-7 bg-white border border-slate-100 rounded-[32px] shadow-xl overflow-hidden">

                {/* Hero Image */}

                <div className="relative h-[300px] md:h-[430px] overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-700">

                    {blog.image ? (
                        <img
                            src={
                                blog.image.startsWith("http")
                                    ? blog.image
                                    : `http://127.0.0.1:8000${blog.image}`
                            }
                            alt={blog.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center text-7xl">
                                📝
                            </div>
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"></div>


                    {/* Views */}

                    <div className="absolute top-7 right-7">
                        <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full text-white text-sm font-bold">
                            <Eye size={16} />
                            {blog.views || 0} Views
                        </div>
                    </div>


                    {/* Category */}

                    <div className="absolute bottom-7 left-7">
                        <span className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                            📖 Academic Blog
                        </span>
                    </div>

                </div>


                {/* Content */}

                <div className="p-7 md:p-10 lg:p-12">

                    {/* Title */}

                    <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-slate-900">
                        {blog.title}
                    </h1>


                    {/* Meta */}

                    <div className="flex flex-wrap gap-3 mt-7">

                        <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                            <User
                                size={17}
                                className="text-blue-600"
                            />

                            <span className="font-semibold text-slate-700">
                                {blog.author_name || "Unknown"}
                            </span>
                        </div>


                        <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
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


                        <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                            <Eye
                                size={17}
                                className="text-blue-600"
                            />

                            <span className="text-slate-600">
                                {blog.views || 0} views
                            </span>
                        </div>

                    </div>


                    {/* Author Card */}

                    <div className="mt-9 flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-[24px] bg-gradient-to-br from-slate-50 to-blue-50/60 border border-slate-100">

                        <div className="flex items-center gap-4">

                            <div className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-xl font-black">
                                {(
                                    blog.author_name ||
                                    "Student"
                                )
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-wider font-bold text-slate-400">
                                    Written by
                                </p>

                                <h3 className="text-lg font-black text-slate-800 mt-1">
                                    {blog.author_name ||
                                        "Unknown"}
                                </h3>
                            </div>

                        </div>


                        <div className="text-left md:text-right">

                            <p className="text-xs uppercase tracking-wider font-bold text-slate-400">
                                Published
                            </p>

                            <p className="font-bold text-slate-700 mt-1">
                                {blog.created_at
                                    ? new Date(
                                          blog.created_at
                                      ).toLocaleDateString()
                                    : "Unknown"}
                            </p>

                        </div>

                    </div>


                    {/* Blog Content */}

                    <div className="mt-10">

                        <h2 className="text-2xl font-black text-slate-800">
                            Article
                        </h2>

                        <div className="mt-5 bg-slate-50/70 border border-slate-100 rounded-[24px] p-6 md:p-8">

                            <p className="text-[17px] md:text-lg leading-9 text-slate-700 whitespace-pre-line">
                                {blog.content ||
                                    "No content provided."}
                            </p>

                        </div>

                    </div>


                    {/* Actions */}

                    <div className="mt-10 flex flex-col sm:flex-row gap-3">

                        <button
                            onClick={handleShare}
                            className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3.5 rounded-xl font-bold transition"
                        >
                            <Share2 size={18} />
                            Share
                        </button>


                        <button
                            onClick={handleCopyLink}
                            className="flex-1 inline-flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-3.5 rounded-xl font-bold transition"
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
                        </button>

                    </div>


                    {/* Owner Actions */}

                    {isOwner && (
                        <div className="mt-8 p-6 rounded-[24px] bg-slate-50 border border-slate-200">

                            <p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-4">
                                Manage your blog
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3">

                                <button
                                    onClick={() =>
                                        navigate(
                                            `/edit-blog/${blog.id}`
                                        )
                                    }
                                    className="flex-1 inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-3.5 rounded-xl font-bold transition"
                                >
                                    <Pencil size={18} />
                                    Edit Blog
                                </button>


                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3.5 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
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

                        </div>
                    )}


                    {/* Bottom Navigation */}

                    <div className="mt-10 pt-7 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">

                        <button
                            onClick={() => navigate("/blogs")}
                            className="font-bold text-blue-600 hover:text-blue-700 transition"
                        >
                            ← Back to Blogs
                        </button>


                        <button
                            onClick={() =>
                                window.scrollTo({
                                    top: 0,
                                    behavior: "smooth",
                                })
                            }
                            className="font-semibold text-slate-500 hover:text-slate-800 transition"
                        >
                            Back to Top ↑
                        </button>

                    </div>

                </div>

            </article>

        </section>
    );
}

export default BlogDetails;