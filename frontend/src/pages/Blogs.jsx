import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Search,
    PenLine,
    ArrowRight,
    BookOpen,
    User,
    Sparkles,
    CalendarDays,
    FileText,
} from "lucide-react";

import API from "../services/api";

function Blogs() {

    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem("access");

    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

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

    const filteredBlogs = blogs.filter((blog) => {

        const keyword = search.toLowerCase();

        return (
            (blog.title || "").toLowerCase().includes(keyword) ||
            (blog.content || "").toLowerCase().includes(keyword) ||
            (blog.author_name || "").toLowerCase().includes(keyword)
        );

    });

    if (loading) {

        return (

            <section className="max-w-7xl mx-auto px-8 py-12">

                <div className="animate-pulse">

                    <div className="h-5 w-32 bg-slate-200 rounded-full"></div>

                    <div className="h-12 w-72 bg-slate-200 rounded-xl mt-5"></div>

                    <div className="h-5 w-96 max-w-full bg-slate-200 rounded mt-4"></div>

                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8 mt-12">

                        {[1, 2, 3, 4, 5, 6].map((item) => (

                            <div
                                key={item}
                                className="bg-white rounded-[28px] border border-slate-100 p-6"
                            >

                                <div className="h-2 bg-slate-200 rounded-full"></div>

                                <div className="w-14 h-14 bg-slate-200 rounded-2xl mt-6"></div>

                                <div className="h-7 bg-slate-200 rounded mt-6"></div>

                                <div className="h-4 bg-slate-200 rounded mt-4"></div>

                                <div className="h-4 bg-slate-200 rounded mt-3 w-4/5"></div>

                                <div className="h-12 bg-slate-200 rounded-xl mt-7"></div>

                            </div>

                        ))}

                    </div>

                </div>

            </section>

        );

    }

    return (

        <section className="max-w-7xl mx-auto px-8 py-10">

            {/* Hero Header */}

            <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-900 p-8 md:p-12 mb-10 shadow-2xl">

                {/* Decorative Glow */}

                <div className="absolute -right-20 -top-20 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl"></div>

                <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>

                <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-8">

                    <div>

                        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-cyan-200 px-4 py-2 rounded-full text-sm font-bold backdrop-blur">

                            <Sparkles size={15} />

                            NoteShare Knowledge Hub

                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-white mt-6 tracking-tight">

                            Student Blogs

                        </h1>

                        <p className="text-slate-300 mt-4 text-lg leading-8 max-w-2xl">

                            Explore tutorials, experiences, study tips and academic
                            ideas shared by the NoteShare community.

                        </p>

                        <div className="flex flex-wrap gap-4 mt-7">

                            <div className="flex items-center gap-2 text-sm text-slate-300">

                                <FileText size={17} />

                                {blogs.length} Articles

                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-300">

                                <BookOpen size={17} />

                                Academic Resources

                            </div>

                        </div>

                    </div>

                    <button
                        onClick={() => {
                            if (isLoggedIn) {
                                navigate("/create-blog");
                            } else {
                                navigate("/login");
                            }
                        }}
                        className="group inline-flex items-center justify-center gap-3 bg-white text-slate-900 px-7 py-4 rounded-2xl font-bold shadow-xl hover:bg-cyan-400 hover:text-white transition-all duration-300 whitespace-nowrap"
                    >

                        <PenLine size={19} />

                        Create Blog

                        <ArrowRight
                            size={18}
                            className="group-hover:translate-x-1 transition-transform"
                        />

                    </button>

                </div>

            </div>


            {/* Search */}

            <div className="bg-white border border-slate-100 rounded-[26px] p-5 shadow-lg mb-10">

                <div className="relative">

                    <Search
                        size={21}
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        type="text"
                        placeholder="Search blogs by title, content or author..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-5 py-4 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />

                </div>

            </div>


            {/* Section Heading */}

            <div className="flex items-end justify-between mb-7">

                <div>

                    <p className="text-sm font-bold uppercase tracking-wider text-blue-600">

                        Latest Articles

                    </p>

                    <h2 className="text-3xl font-black text-slate-800 mt-2">

                        Explore Community Blogs

                    </h2>

                </div>

                <p className="hidden md:block text-sm text-slate-400">

                    {filteredBlogs.length} result
                    {filteredBlogs.length !== 1 ? "s" : ""}

                </p>

            </div>


            {/* Empty State */}

            {filteredBlogs.length === 0 ? (

                <div className="bg-white border border-slate-100 rounded-[30px] shadow-lg p-14 text-center">

                    <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">

                        <BookOpen
                            size={36}
                            className="text-blue-600"
                        />

                    </div>

                    <h2 className="text-2xl font-black text-slate-800 mt-6">

                        {search ? "No Blogs Found" : "No Blogs Yet"}

                    </h2>

                    <p className="text-slate-500 mt-3 max-w-md mx-auto">

                        {search
                            ? "Try another keyword or search for a different author."
                            : "Be the first student to share an article with the NoteShare community."
                        }

                    </p>

                    {!search && (

                        <button
                            onClick={() => {
                                if (isLoggedIn) {
                                    navigate("/create-blog");
                                } else {
                                    navigate("/login");
                                }
                            }}
                            className="mt-7 inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition"
                        >

                            <PenLine size={18} />

                            Create First Blog

                        </button>

                    )}

                </div>

            ) : (

                /* Blog Cards */

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

                    {filteredBlogs.map((blog) => (

                        <article
                            key={blog.id}
                            className="group relative bg-white rounded-[28px] border border-slate-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                        >

                            {/* Top Gradient */}

                            <div className="h-1.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400"></div>

                            <div className="p-7">

                                {/* Card Top */}

                                <div className="flex items-start justify-between gap-4">

                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 flex items-center justify-center">

                                        <BookOpen
                                            size={25}
                                            className="text-blue-600"
                                        />

                                    </div>

                                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full">

                                        Article

                                    </span>

                                </div>


                                {/* Title */}

                                <h2 className="text-2xl font-black text-slate-800 mt-6 line-clamp-2 group-hover:text-blue-600 transition-colors">

                                    {blog.title}

                                </h2>


                                {/* Content */}

                                <p className="text-slate-500 mt-4 leading-7 line-clamp-4">

                                    {blog.content ||
                                        "Explore this educational article shared by the NoteShare community."
                                    }

                                </p>


                                {/* Author */}

                                <div className="flex items-center gap-3 mt-7 pt-5 border-t border-slate-100">

                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold">

                                        {(blog.author_name || "S")
                                            .charAt(0)
                                            .toUpperCase()}

                                    </div>

                                    <div className="flex-1 min-w-0">

                                        <p className="text-xs text-slate-400">

                                            Written by

                                        </p>

                                        <p className="font-bold text-slate-700 text-sm truncate">

                                            {blog.author_name || "Student"}

                                        </p>

                                    </div>

                                    <User
                                        size={17}
                                        className="text-slate-300"
                                    />

                                </div>


                                {/* Read Button */}

                                <button
                                    onClick={() => navigate(`/blog/${blog.id}`)}
                                    className="w-full mt-6 flex items-center justify-center gap-2 bg-slate-900 text-white py-3.5 rounded-xl font-bold group-hover:bg-blue-600 transition-all"
                                >

                                    Read Article

                                    <ArrowRight
                                        size={18}
                                        className="group-hover:translate-x-1 transition-transform"
                                    />

                                </button>

                            </div>

                        </article>

                    ))}

                </div>

            )}

        </section>

    );

}

export default Blogs;