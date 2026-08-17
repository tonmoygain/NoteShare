import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

import {
    FileText,
    Image,
    Send,
    ArrowLeft,
    Sparkles,
    CheckCircle2,
    Loader2,
    BookOpen,
    PenLine,
} from "lucide-react";

import API from "../services/api";

function CreateBlog() {
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            alert("Please enter blog title");
            return;
        }

        if (!content.trim()) {
            alert("Please enter blog content");
            return;
        }

        setUploading(true);

        const formData = new FormData();

        formData.append("title", title);
        formData.append("content", content);

        if (image) {
            formData.append("image", image);
        }

        formData.append(
            "username",
            localStorage.getItem("username")
        );

        try {
            await API.post(
                "blogs/create/",
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                }
            );

            alert("Blog Published Successfully!");

            navigate("/blogs");
        } catch (err) {
            console.log(err);

            alert("Failed to publish blog");
        } finally {
            setUploading(false);
        }
    };

    return (
        <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">

            <motion.div
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
                        from-slate-950
                        via-blue-950
                        to-cyan-800
                        px-6
                        py-8
                        text-white
                        sm:px-9
                        sm:py-10
                        lg:px-10
                        lg:py-12
                    "
                >
                    <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl" />

                    <div className="pointer-events-none absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />

                    <div className="relative">

                        <button
                            type="button"
                            onClick={() => navigate("/blogs")}
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-xl
                                border
                                border-white/10
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
                            Back to Blogs
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
                                    border-white/10
                                    bg-white/10
                                    shadow-xl
                                    backdrop-blur-sm
                                "
                            >
                                <Sparkles size={30} />
                            </motion.div>

                            <div>
                                <div className="
                                    mb-2
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-full
                                    border
                                    border-white/10
                                    bg-white/10
                                    px-3
                                    py-1.5
                                    text-[10px]
                                    font-extrabold
                                    uppercase
                                    tracking-[0.16em]
                                    text-cyan-200
                                    backdrop-blur-sm
                                ">
                                    <PenLine size={12} />
                                    Creator Studio
                                </div>

                                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                                    Create New Blog
                                </h1>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                                    Share your knowledge, ideas and experiences with the NoteShare community.
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

                    {/* Step 01 */}

                    <div>
                        <div className="mb-5">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-600">
                                Step 01
                            </p>

                            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-800">
                                Give Your Blog a Title
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                A clear title makes your article easier to discover.
                            </p>
                        </div>

                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                            <FileText
                                size={17}
                                className="text-blue-600"
                            />
                            Blog Title
                        </label>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) =>
                                setTitle(e.target.value)
                            }
                            placeholder="Enter your blog title..."
                            disabled={uploading}
                            className="
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

                    {/* Step 02 */}

                    <div>
                        <div className="mb-5">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-600">
                                Step 02
                            </p>

                            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-800">
                                Write Your Story
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                Share something useful, educational or interesting with other students.
                            </p>
                        </div>

                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                            <BookOpen
                                size={17}
                                className="text-blue-600"
                            />
                            Blog Content
                        </label>

                        <textarea
                            rows="14"
                            value={content}
                            onChange={(e) =>
                                setContent(e.target.value)
                            }
                            placeholder="Write your blog here..."
                            disabled={uploading}
                            className="
                                mt-3
                                w-full
                                resize-none
                                rounded-[24px]
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

                        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                            <span>
                                Write clearly and keep your paragraphs easy to read.
                            </span>

                            <span className="font-semibold">
                                {content.length} characters
                            </span>
                        </div>
                    </div>

                    {/* Step 03 */}

                    <div>
                        <div className="mb-5">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-600">
                                Step 03
                            </p>

                            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-800">
                                Add a Cover Image
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                Optional, but a good cover image makes your article stand out.
                            </p>
                        </div>

                        <label
                            className="
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
                                from-blue-50/70
                                via-white
                                to-cyan-50/60
                                px-6
                                py-10
                                text-center
                                transition
                                duration-300
                                hover:-translate-y-0.5
                                hover:border-blue-400
                                hover:shadow-[0_18px_45px_rgba(37,99,235,0.08)]
                            "
                        >
                            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-blue-400/10 blur-3xl transition-transform duration-700 group-hover:scale-125" />

                            <motion.div
                                whileHover={{
                                    y: -3,
                                    scale: 1.03,
                                }}
                                className="
                                    relative
                                    flex
                                    h-16
                                    w-16
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-gradient-to-br
                                    from-blue-600
                                    to-cyan-500
                                    text-white
                                    shadow-lg
                                    shadow-blue-500/20
                                "
                            >
                                <Image size={28} />
                            </motion.div>

                            <h3 className="relative mt-5 text-lg font-black text-slate-800">
                                Choose a Cover Image
                            </h3>

                            <p className="relative mt-2 text-sm text-slate-500">
                                JPG, PNG or JPEG
                            </p>

                            <div className="relative mt-4 rounded-full bg-white px-4 py-2 text-xs font-bold text-blue-600 shadow-sm">
                                Click to browse
                            </div>

                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg"
                                onChange={(e) =>
                                    setImage(
                                        e.target.files?.[0] ||
                                            null
                                    )
                                }
                                disabled={uploading}
                                className="hidden"
                            />
                        </label>

                        {image && (
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
                                    mt-4
                                    flex
                                    items-center
                                    gap-3
                                    rounded-2xl
                                    border
                                    border-emerald-100
                                    bg-emerald-50
                                    p-4
                                "
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
                                    <CheckCircle2 size={18} />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                                        Selected Image
                                    </p>

                                    <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                                        {image.name}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Publish Area */}

                    <div className="border-t border-slate-100 pt-7">
                        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                            <Sparkles
                                size={18}
                                className="mt-0.5 shrink-0 text-blue-600"
                            />

                            <p className="text-sm leading-6 text-blue-700">
                                Your article will be published to the NoteShare community and can be discovered from the Blogs section.
                            </p>
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
                                        Publishing Blog...
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        Publish Blog
                                    </>
                                )}
                            </span>
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </section>
    );
}

export default CreateBlog;