import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
    useNavigate,
    useSearchParams,
} from "react-router-dom";

import {
    Search,
    PenLine,
    ArrowRight,
    BookOpen,
    User,
    Sparkles,
    FileText,
    SlidersHorizontal,
} from "lucide-react";

import API from "../services/api";

function Blogs() {

    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem("access");

    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(
        searchParams.get("search") || ""
    );

    useEffect(() => {
        API.get("blogs/")
            .then((res) => {
                setBlogs(res.data || []);
                setLoading(false);
            })
            .catch((err) => {
                console.log("Blogs API Error:", err);
                setBlogs([]);
                setLoading(false);
            });
    }, []);

    // =========================================
    // READ SEARCH FROM URL
    // =========================================

    useEffect(() => {

        const query =
            searchParams.get("search") || "";

        setSearch(query);

    }, [searchParams]);
    

    const filteredBlogs = blogs.filter((blog) => {
        const keyword = search.toLowerCase().trim();

        if (!keyword) return true;

        return (
            (blog.title || "")
                .toLowerCase()
                .includes(keyword) ||
            (blog.content || "")
                .toLowerCase()
                .includes(keyword) ||
            (blog.author_name || "")
                .toLowerCase()
                .includes(keyword)
        );
    });

    const handleCreateBlog = () => {
        if (isLoggedIn) {
            navigate("/create-blog");
        } else {
            navigate("/login");
        }
    };


    return (
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">

            {/* =====================================================
                HERO
            ====================================================== */}

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
                    relative
                    mb-9
                    overflow-hidden
                    rounded-[34px]
                    border
                    border-slate-200/50
                    bg-gradient-to-br
                    from-slate-950
                    via-blue-950
                    to-cyan-900
                    p-7
                    text-white
                    shadow-[0_25px_70px_rgba(15,23,42,0.13)]
                    sm:p-9
                    lg:p-12
                "
            >
                <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl" />

                <div className="pointer-events-none absolute right-1/3 top-1/3 h-48 w-48 rounded-full bg-indigo-400/10 blur-3xl" />

                <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

                    <div className="max-w-3xl">

                        <motion.div
                            initial={{
                                opacity: 0,
                                y: 8,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                duration: 0.4,
                                delay: 0.08,
                            }}
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-full
                                border
                                border-white/10
                                bg-white/10
                                px-4
                                py-2
                                text-xs
                                font-bold
                                text-cyan-200
                                backdrop-blur-sm
                            "
                        >
                            <Sparkles size={14} />
                            NoteShare Knowledge Hub
                        </motion.div>

                        <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                            Student Blogs
                        </h1>

                        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                            Explore tutorials, experiences, study tips and academic ideas shared by the NoteShare community.
                        </p>

                        <div className="mt-7 flex flex-wrap gap-3">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 backdrop-blur-sm">
                                <FileText size={16} />
                                {blogs.length} Articles
                            </div>

                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 backdrop-blur-sm">
                                <BookOpen size={16} />
                                Academic Resources
                            </div>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{
                            y: -2,
                        }}
                        whileTap={{
                            scale: 0.98,
                        }}
                        onClick={handleCreateBlog}
                        className="
                            group
                            inline-flex
                            w-full
                            items-center
                            justify-center
                            gap-3
                            rounded-2xl
                            bg-white
                            px-7
                            py-4
                            font-bold
                            text-slate-900
                            shadow-xl
                            transition
                            hover:bg-cyan-400
                            hover:text-white
                            sm:w-auto
                        "
                    >
                        <PenLine size={19} />

                        Create Blog

                        <ArrowRight
                            size={18}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                    </motion.button>
                </div>
            </motion.div>

            {/* =====================================================
                SEARCH
            ====================================================== */}

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
                    delay: 0.1,
                }}
                className="
                    blogs-search-panel
                    mb-10
                    rounded-[26px]
                    border
                    border-slate-200/80
                    bg-white/85
                    p-4
                    shadow-[0_10px_30px_rgba(15,23,42,0.045)]
                    backdrop-blur-sm
                    sm:p-5
                "
            >
                <div className="relative">

                    <Search
                        size={21}
                        className="
                            absolute
                            left-5
                            top-1/2
                            -translate-y-1/2
                            text-slate-400
                        "
                    />

                    <input
                        type="text"
                        placeholder="Search blogs by title, content or author..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        className="
                            h-14
                            w-full
                            rounded-2xl
                            border
                            border-slate-200
                            bg-slate-50/80
                            pl-14
                            pr-5
                            text-slate-700
                            outline-none
                            transition
                            placeholder:text-slate-400
                            focus:border-blue-500
                            focus:bg-white
                            focus:ring-4
                            focus:ring-blue-100
                        "
                    />

                    <div className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 items-center gap-2 text-xs font-semibold text-slate-400 sm:flex">
                        <SlidersHorizontal size={14} />
                        Search
                    </div>
                </div>
            </motion.div>

            {/* =====================================================
                SECTION HEADING
            ====================================================== */}

            <div className="mb-7 flex items-end justify-between gap-4">

                <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-600">
                        Latest Articles
                    </p>

                    <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">
                        Explore Community Blogs
                    </h2>
                </div>

                <div className="blogs-result-count hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-400 shadow-sm md:block">
                    {filteredBlogs.length} result
                    {filteredBlogs.length !== 1 ? "s" : ""}
                </div>
            </div>

            {/* =====================================================
                EMPTY STATE
            ====================================================== */}

            {filteredBlogs.length === 0 ? (
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 14,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    className="
                        blogs-empty-state
                        rounded-[30px]
                        border
                        border-slate-200/80
                        bg-white
                        p-10
                        text-center
                        shadow-[0_15px_40px_rgba(15,23,42,0.05)]
                        sm:p-14
                    "
                >
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600">
                        <BookOpen size={36} />
                    </div>

                    <h2 className="mt-6 text-2xl font-black text-slate-800">
                        {search
                            ? "No Blogs Found"
                            : "No Blogs Yet"}
                    </h2>

                    <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500 sm:text-base">
                        {search
                            ? "Try another keyword or search for a different author."
                            : "Be the first student to share an article with the NoteShare community."}
                    </p>

                    {!search && (
                        <motion.button
                            whileHover={{
                                y: -2,
                            }}
                            whileTap={{
                                scale: 0.98,
                            }}
                            onClick={handleCreateBlog}
                            className="
                                mt-7
                                inline-flex
                                items-center
                                gap-2
                                rounded-xl
                                bg-gradient-to-r
                                from-blue-600
                                to-cyan-500
                                px-6
                                py-3
                                font-bold
                                text-white
                                shadow-lg
                                shadow-blue-500/15
                                transition
                                hover:shadow-xl
                            "
                        >
                            <PenLine size={18} />
                            Create First Blog
                        </motion.button>
                    )}
                </motion.div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

                    {filteredBlogs.map((blog, index) => (
                        <motion.article
                            key={blog.id}
                            initial={{
                                opacity: 0,
                                y: 20,
                            }}
                            whileInView={{
                                opacity: 1,
                                y: 0,
                            }}
                            viewport={{
                                once: true,
                                amount: 0.12,
                            }}
                            transition={{
                                duration: 0.45,
                                delay:
                                    index % 3 * 0.06,
                                ease: "easeOut",
                            }}
                            whileHover={{
                                y: -7,
                            }}
                            className="
                                blogs-card
                                group
                                relative
                                overflow-hidden
                                rounded-[28px]
                                border
                                border-slate-200/80
                                bg-white
                                shadow-[0_10px_30px_rgba(15,23,42,0.045)]
                                transition-shadow
                                duration-300
                                hover:shadow-[0_25px_55px_rgba(15,23,42,0.10)]
                            "
                        >
                            {/* Top accent */}
                            <div className="h-1.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400" />

                            {/* Image */}
                            {blog.image && (
                                <div className="blogs-card-image relative h-52 overflow-hidden bg-slate-100">
                                    <img
                                        src={blog.image}
                                        alt={blog.title}
                                        className="
                                            h-full
                                            w-full
                                            object-cover
                                            transition-transform
                                            duration-700
                                            group-hover:scale-105
                                        "
                                        loading="lazy"
                                    />

                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/15 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                </div>
                            )}

                            <div className="p-6 sm:p-7">

                                {/* Card Top */}

                                <div className="flex items-start justify-between gap-4">

                                    <motion.div
                                        whileHover={{
                                            rotate: -3,
                                            scale: 1.04,
                                        }}
                                        className="
                                            blogs-card-icon
                                            flex
                                            h-14
                                            w-14
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-2xl
                                            border
                                            border-blue-100
                                            bg-gradient-to-br
                                            from-blue-50
                                            to-cyan-50
                                            text-blue-600
                                        "
                                    >
                                        <BookOpen size={25} />
                                    </motion.div>

                                    <span className="blogs-card-badge rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                                        Article
                                    </span>
                                </div>

                                {/* Title */}

                                <h2 className="mt-6 line-clamp-2 text-2xl font-black leading-tight tracking-tight text-slate-800 transition-colors duration-300 group-hover:text-blue-600">
                                    {blog.title}
                                </h2>

                                {/* Content */}

                                <p className="mt-4 line-clamp-4 text-sm leading-7 text-slate-500">
                                    {blog.content ||
                                        "Explore this educational article shared by the NoteShare community."}
                                </p>

                                {/* Author */}

                                <div className="blogs-card-author mt-7 flex items-center gap-3 border-t border-slate-100 pt-5">

                                    <div className="
                                        flex
                                        h-10
                                        w-10
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-gradient-to-r
                                        from-blue-600
                                        to-cyan-500
                                        font-bold
                                        text-white
                                        shadow-sm
                                    ">
                                        {(blog.author_name || "S")
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                            Written by
                                        </p>

                                        <p className="truncate text-sm font-bold text-slate-700">
                                            {blog.author_name ||
                                                "Student"}
                                        </p>
                                    </div>

                                    <User
                                        size={17}
                                        className="shrink-0 text-slate-300 transition-colors group-hover:text-blue-400"
                                    />
                                </div>

                                {/* Read Button */}

                                <button
                                    onClick={() =>
                                        navigate(
                                            `/blog/${blog.id}`
                                        )
                                    }
                                    className="
                                        group/read
                                        mt-6
                                        flex
                                        w-full
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-xl
                                        bg-slate-900
                                        py-3.5
                                        font-bold
                                        text-white
                                        transition
                                        duration-300
                                        hover:bg-blue-600
                                        hover:shadow-lg
                                        hover:shadow-blue-500/15
                                    "
                                >
                                    Read Article

                                    <ArrowRight
                                        size={18}
                                        className="transition-transform duration-300 group-hover/read:translate-x-1"
                                    />
                                </button>
                            </div>
                        </motion.article>
                    ))}
                </div>
            )}

        </section>
    );
}

export default Blogs;