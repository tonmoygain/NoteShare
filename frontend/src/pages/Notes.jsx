import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

import {
    Search,
    X,
    SlidersHorizontal,
    BookOpen,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    Download,
    Eye,
    ArrowRight,
} from "lucide-react";

import NoteCard from "../components/NoteCard";
import TopNotes from "../components/TopNotes";

function Notes() {

    const navigate = useNavigate();

    const [notes, setNotes] = useState([]);
    const [mostDownloaded, setMostDownloaded] = useState([]);
    const [mostViewed, setMostViewed] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [department, setDepartment] = useState("All");

    const departmentOptions = [
        "All",
        "CSE",
        "EEE",
        "BBA",
        "English",
        "Law",
    ];

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {

        setLoading(true);

        API.get(`notes/?page=${page}`)
            .then((res) => {

                setNotes(res.data.notes || []);
                setTotalPages(res.data.total_pages || 1);

            })
            .catch((err) => {

                console.log("Notes API Error:", err);

            })
            .finally(() => {

                setLoading(false);

            });

        API.get("dashboard/")
            .then((res) => {

                setMostDownloaded(
                    res.data.most_downloaded || []
                );

                setMostViewed(
                    res.data.most_viewed || []
                );

            })
            .catch((err) => {

                console.log("Dashboard API Error:", err);

            });

    }, [page]);


    const filteredNotes = notes.filter((note) => {

        const keyword = search.toLowerCase().trim();

        const title =
            (note.title || "").toLowerCase();

        const description =
            (note.description || "").toLowerCase();

        const dept =
            (note.department || "").toLowerCase();

        const uploader =
            (note.uploader_name || "").toLowerCase();

        const searchMatch =
            title.includes(keyword) ||
            description.includes(keyword) ||
            dept.includes(keyword) ||
            uploader.includes(keyword);

        const departmentMatch =
            department === "All" ||
            note.department === department;

        return searchMatch && departmentMatch;

    });


    const clearFilters = () => {

        setSearch("");
        setDepartment("All");
        setPage(1);

    };


    if (loading) {

        return (

            <section className="max-w-7xl mx-auto px-8 py-12">

                {/* Header Skeleton */}

                <div className="rounded-[32px] bg-slate-200 animate-pulse p-10">

                    <div className="h-6 w-40 bg-slate-300 rounded-full"></div>

                    <div className="h-12 w-80 bg-slate-300 rounded-xl mt-6"></div>

                    <div className="h-5 w-[520px] max-w-full bg-slate-300 rounded mt-5"></div>

                    <div className="h-5 w-96 max-w-full bg-slate-300 rounded mt-3"></div>

                </div>


                {/* Search Skeleton */}

                <div className="h-20 bg-slate-200 rounded-[28px] mt-10 animate-pulse"></div>


                {/* Cards Skeleton */}

                <div className="grid md:grid-cols-2 gap-7 mt-10">

                    {[1, 2, 3, 4].map((item) => (

                        <div
                            key={item}
                            className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm animate-pulse"
                        >

                            <div className="h-7 bg-slate-200 rounded-lg w-3/4"></div>

                            <div className="h-4 bg-slate-200 rounded mt-5"></div>

                            <div className="h-4 bg-slate-200 rounded mt-3 w-5/6"></div>

                            <div className="h-12 bg-slate-200 rounded-xl mt-8"></div>

                        </div>

                    ))}

                </div>

            </section>

        );

    }


    return (

        <section className="max-w-7xl mx-auto px-8 py-12">

            {/* =====================================================
                PREMIUM HERO
            ====================================================== */}

            <section className="relative overflow-hidden rounded-[36px] bg-slate-950 text-white shadow-[0_25px_70px_rgba(15,23,42,0.20)]">

              

                {/* Background gradients */}

                <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-950 to-cyan-950"></div>

                {/* Glow */}

                <div className="absolute -top-32 -right-20 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl"></div>

                <div className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl"></div>

                {/* Content */}

                <div className="relative z-10 px-8 py-12 md:px-14 md:py-16">

                    <div className="max-w-3xl">

                        {/* Badge */}

                        <div className=" inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-sm font-bold text-blue-100">
                        
                        <BookOpen size={16} />

                        NoteShare Library

                        </div>

                        {/* Heading */}

                        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05] mt-6">
                            Discover Notes.
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-white">
                                Learn Better.
                            </span>
                        </h1>

                        {/* Description */}

                        <p className="text-slate-300 text-base md:text-lg leading-8 mt-6 max-w-2xl">
                            Explore organized lecture notes, study materials and academic resources shared by students across departments.
                        </p>

                        {/* Stats */}

                        <div className="flex flex-wrap gap-4 mt-8">

                            <div className="px-5 py-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md">
                            
                                <p className="text-2xl font-black">
                                    {filteredNotes.length}
                                </p>

                                <p className="text-xs text-slate-400 mt-1">
                                    Notes on this page
                                </p>

                                <p className="text-xs text-slate-400 mt-1">
                                    Total Notes
                                </p>
                            </div>

                            <div className="px-5 py-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md">

                                <p className="text-2xl font-black">
                                    {departmentOptions.filter(
                                        (item) => item !== "All"
                                    ).length}
                                </p>

                                <p className="text-xs text-slate-400 mt-1">
                                    Departments
                                </p>
                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                PREMIUM SEARCH & FILTER
            ====================================================== */}

            <section className="mt-10">

                <div className="bg-white rounded-[30px] border border-slate-100 shadow-[0_10px_40px_rgba(15,23,42,0.06)] p-6 md:p-7">

                    {/* Header */}

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-6">

                        <div>
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Search size={18} />
                                </div>

                                <h2 className="text-xl font-black text-slate-800">
                                    Find Study Resources
                                </h2>
                            </div>

                            <p className="text-sm text-slate-400 mt-2">
                                Search by note title, description, department or uploader.
                            </p>
                        </div>

                        {/* Result count */}

                        <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-full text-sm font-bold text-slate-600">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            {filteredNotes.length} Notes Found
                        </div>
                    </div>

                    {/* Controls */}

                    <div className="grid lg:grid-cols-[1fr_auto] gap-4">

                        {/* Search */}

                        <div className="relative">

                            <Search
                                size={19}
                                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                placeholder="Search notes, subjects, departments..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-12 text-slate-700 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
                            />

                            {search && (

                                <button
                                    onClick={() => setSearch("")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-slate-200 text-slate-500 flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition">
                                        <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* Department */}

                        <div className="relative min-w-[230px]">

                            <SlidersHorizontal
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                            />

                            <select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-10 text-slate-700 font-semibold outline-none cursor-pointer focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all">
                                    
                                    <option value="All">
                                        All Departments
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
                    </div>

                    {/* Active Filter */}

                    {(search || department !== "All") && (

                        <div className="flex flex-wrap items-center gap-3 mt-5 pt-5 border-t border-slate-100">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Active Filters
                            </span>

                            {search && (

                                <button
                                    onClick={() => setSearch("")}
                                    className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-blue-100 transition">

                                        Search: "{search}"

                                        <X size={13} />
                                </button>
                            )}

                            {department !== "All" && (

                                <button
                                    onClick={() => setDepartment("All")}
                                    className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 border border-violet-100 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-violet-100 transition">

                                        {department}
                                        <X size={13} />
                                    </button>

                            )}

                            <button
                                onClick={() => {
                                    setSearch("");
                                    setDepartment("All");
                                }}

                                className="text-xs font-bold text-red-500 hover:text-red-600 transition"
                            >
                                Clear All
                            </button> 
                        </div>

                    )}

                </div>


            </section>
            
            {/* =====================================================
                EXPLORE NOTES
            ====================================================== */}

            <div className="mt-16">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">

                    <div>

                        <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold border border-blue-100">

                            <Sparkles size={15} />

                            Study Collection

                        </span>


                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-5 tracking-tight">

                            Explore Notes

                        </h2>


                        <p className="text-slate-500 mt-3 text-lg">

                            Find useful study materials shared by students.

                        </p>

                    </div>


                    <div className="bg-slate-100 px-5 py-3 rounded-2xl text-sm font-bold text-slate-600">

                        {filteredNotes.length} notes found

                    </div>

                </div>


                {/* Notes */}

                {filteredNotes.length === 0 ? (

                    <div className="bg-white border border-slate-200 rounded-[30px] p-16 text-center shadow-sm">

                        <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center">

                            <BookOpen size={36} />

                        </div>


                        <h3 className="text-2xl font-black text-slate-800 mt-6">

                            No Notes Found

                        </h3>


                        <p className="text-slate-500 mt-3 max-w-md mx-auto">

                            Try another keyword or select a different department.

                        </p>


                        {(search || department !== "All") && (

                            <button
                                onClick={clearFilters}
                                className="mt-7 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition"
                            >

                                Clear Filters

                            </button>

                        )}

                    </div>

                ) : (

                    <div className="grid md:grid-cols-2 gap-7">

                        {filteredNotes.map((note) => (

                            <NoteCard
                                key={note.id}
                                note={note}
                            />

                        ))}

                    </div>

                )}


                {/* Pagination */}

                {totalPages > 1 && (

                    <div className="flex justify-center items-center gap-3 mt-12">

                        <button
                            onClick={() =>
                                setPage((prev) =>
                                    Math.max(prev - 1, 1)
                                )
                            }
                            disabled={page === 1}
                            className="
                                w-12
                                h-12
                                rounded-xl
                                bg-slate-900
                                text-white
                                flex
                                items-center
                                justify-center
                                disabled:opacity-30
                                disabled:cursor-not-allowed
                                hover:bg-blue-600
                                transition
                            "
                        >

                            <ChevronLeft size={20} />

                        </button>


                        <div className="px-6 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700">

                            Page {page} of {totalPages}

                        </div>


                        <button
                            onClick={() =>
                                setPage((prev) =>
                                    Math.min(prev + 1, totalPages)
                                )
                            }
                            disabled={page === totalPages}
                            className="
                                w-12
                                h-12
                                rounded-xl
                                bg-blue-600
                                text-white
                                flex
                                items-center
                                justify-center
                                disabled:opacity-30
                                disabled:cursor-not-allowed
                                hover:bg-blue-700
                                transition
                            "
                        >

                            <ChevronRight size={20} />

                        </button>

                    </div>

                )}

            </div>


            {/* =====================================================
              PREMIUM POPULAR NOTES
            ====================================================== */}

            <section className="mt-20">

                <div className="relative overflow-hidden rounded-[34px] bg-white border border-slate-100 shadow-[0_15px_50px_rgba(15,23,42,0.07)]">

                    {/* Decorative Background */}

                    <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-100/50 rounded-full blur-3xl"></div>

                    <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-violet-100/40 rounded-full blur-3xl"></div>

                    {/* Header */}

                    <div className="relative px-7 md:px-10 pt-9 pb-7">

                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">

                            <div>
                                <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-600 px-4 py-2 rounded-full text-sm font-bold">

                                    <Sparkles size={15} />

                                    Community Highlights

                                </div>

                                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-5 tracking-tight">
                                    Popular Study Resources
                                </h2>

                                <p className="text-slate-500 mt-3 text-base md:text-lg max-w-2xl leading-7">

                                    Discover the notes students are viewing and downloading the most.

                                </p>
                            </div>

                            <div className="hidden lg:flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2.5 rounded-xl text-sm font-bold">

                                <BookOpen size={16} />

                                Student Picks

                            </div>

                        </div>

                    </div>

                    {/* Rankings */}

                    <div className="relative px-5 md:px-8 pb-8">

                        <div className="grid lg:grid-cols-2 gap-6">

                            {/* Most Downloaded */}

                            <div className="group rounded-[28px] bg-gradient-to-br from-blue-50 via-white to-cyan-50 border border-blue-100 p-1 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-500">
                            
                                <div className="bg-white rounded-[25px] overflow-hidden">

                                    <TopNotes
                                        title=" Most Downloaded Notes"
                                        notes={mostDownloaded}
                                        type="download"
                                    />
                                </div>
                            </div>

                            {/* Most Viewed */}

                            <div className="group rounded-[28px] bg-gradient-to-br from-violet-50 via-white to-purple-50 border border-violet-100 p-1 hover:shadow-xl hover:shadow-violet-100/50 transition-all duration-500">
                            
                                <div className="bg-white rounded-[25px] overflow-hidden">

                                    <TopNotes
                                    title=" Most Viewed Notes"
                                    notes={mostViewed}
                                    type="view"
                                    />

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* =====================================================
                        PREMIUM UPLOAD CTA
                    ====================================================== */}

                    <section className="mt-16">


                        <div className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-800 p-8 md:p-10 lg:p-12 shadow-[0_20px_60px_rgba(15,23,42,0.18)]">

                             {/* Background Effects */}

                            <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl"></div>

                            <div className="absolute -bottom-28 -left-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>

                            <div className="absolute top-0 right-1/3 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>


                             <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-10">

                                {/* Text */}

                                <div className="max-w-2xl">

                                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 backdrop-blur-md text-blue-100 px-4 py-2 rounded-full text-sm font-bold">

                                        <Sparkles size={15} />

                                        Contribute to NoteShare

                                    </div>


                                    <h3 className="text-3xl md:text-4xl font-black text-white mt-5 tracking-tight">

                                        Have useful study materials?

                                    </h3>


                                    <p className="text-blue-100/80 mt-4 text-base md:text-lg leading-7 max-w-xl">

                                        Share your lecture notes with other students and help build a stronger academic community.

                                    </p>


                                    {/* Small Benefits */}

                                    <div className="flex flex-wrap gap-3 mt-6">

                                        <span className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-blue-50 px-3 py-2 rounded-xl text-xs font-semibold">

                                            <BookOpen size={14} />

                                            Share Resources

                                        </span>

                                        <span className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-blue-50 px-3 py-2 rounded-xl text-xs font-semibold">

                                            <Download size={14} />

                                            Help Students

                                        </span>

                                    </div>

                                </div>


                                {/* Button */}

                                <button
                                    onClick={() => navigate("/upload")}
                                    className="group shrink-0 inline-flex items-center justify-center gap-3 bg-white text-blue-700 px-7 md:px-8 py-4 rounded-2xl font-black shadow-xl hover:shadow-2xl hover:scale-[1.03] transition-all duration-300"
                                >

                                    Upload a Note

                                    <ArrowRight
                                        size={19}
                                        className="group-hover:translate-x-1 transition-transform"
                                    />

                                </button>

                            </div>

                        </div>


                    </section>

                </div>
                
            </section>
        
        </section>

    )}

export default Notes;