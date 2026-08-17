import { useEffect, useState } from "react";
import { motion } from "motion/react";

import {
    Search,
    SlidersHorizontal,
    BookOpen,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    Upload,
    X,
    Layers3,
    GraduationCap,
    ArrowUpRight,
    Filter,
} from "lucide-react";

import { Link } from "react-router-dom";

import API from "../services/api";
import NoteCard from "../components/NoteCard";

function Notes() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [department, setDepartment] = useState("All");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const departmentOptions = [
        "All",
        "CSE",
        "EEE",
        "BBA",
        "English",
        "Law",
    ];

    // =========================================================
    // LOAD NOTES
    // =========================================================

    useEffect(() => {
        let mounted = true;

        const loadNotes = async () => {
            setLoading(true);

            try {
                const response = await API.get(
                    `notes/?page=${page}`
                );

                if (!mounted) return;

                const data = response?.data || {};

                setNotes(
                    Array.isArray(data.notes)
                        ? data.notes
                        : []
                );

                setTotalPages(
                    Number(data.total_pages) || 1
                );
            } catch (error) {
                console.error(
                    "Notes API Error:",
                    error
                );

                if (mounted) {
                    setNotes([]);
                    setTotalPages(1);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadNotes();

        return () => {
            mounted = false;
        };
    }, [page]);

    // =========================================================
    // FILTER
    // =========================================================

    const filteredNotes = notes.filter((note) => {
        const keyword = search
            .toLowerCase()
            .trim();

        const title = (
            note?.title || ""
        ).toLowerCase();

        const description = (
            note?.description || ""
        ).toLowerCase();

        const dept = (
            note?.department || ""
        ).toLowerCase();

        const uploader = (
            note?.uploader_name || ""
        ).toLowerCase();

        const searchMatch =
            !keyword ||
            title.includes(keyword) ||
            description.includes(keyword) ||
            dept.includes(keyword) ||
            uploader.includes(keyword);

        const departmentMatch =
            department === "All" ||
            note?.department === department;

        return (
            searchMatch &&
            departmentMatch
        );
    });

    // =========================================================
    // CLEAR FILTERS
    // =========================================================

    const clearFilters = () => {
        setSearch("");
        setDepartment("All");
        setPage(1);
    };

    // =========================================================
    // PAGINATION
    // =========================================================

    const previousPage = () => {
        setPage((current) =>
            Math.max(current - 1, 1)
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const nextPage = () => {
        setPage((current) =>
            Math.min(
                current + 1,
                totalPages
            )
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // =========================================================
    // LOADING UI
    // =========================================================

    if (loading) {
        return (
            <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:py-12">
                <div className="animate-pulse">

                    {/* Hero skeleton */}

                    <div
                        className="
                            overflow-hidden
                            rounded-[34px]
                            border
                            border-slate-200
                            bg-slate-200
                            p-7
                            sm:p-10
                            lg:p-14
                        "
                    >
                        <div className="h-7 w-40 rounded-full bg-slate-300" />

                        <div className="mt-7 h-14 w-3/4 max-w-2xl rounded-2xl bg-slate-300" />

                        <div className="mt-5 h-5 w-full max-w-2xl rounded-lg bg-slate-300" />

                        <div className="mt-3 h-5 w-2/3 max-w-xl rounded-lg bg-slate-300" />

                        <div className="mt-8 flex gap-3">
                            <div className="h-11 w-40 rounded-xl bg-slate-300" />
                            <div className="h-11 w-40 rounded-xl bg-slate-300" />
                        </div>
                    </div>

                    {/* Filter skeleton */}

                    <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-5">
                        <div className="h-14 rounded-2xl bg-slate-200" />
                    </div>

                    {/* Card skeletons */}

                    <div className="mt-10 grid gap-6 md:grid-cols-2">
                        {[1, 2, 3, 4].map(
                            (item) => (
                                <div
                                    key={item}
                                    className="
                                        rounded-[28px]
                                        border
                                        border-slate-200
                                        bg-white
                                        p-6
                                    "
                                >
                                    <div className="h-48 rounded-2xl bg-slate-200" />

                                    <div className="mt-6 h-6 w-3/4 rounded-lg bg-slate-200" />

                                    <div className="mt-4 h-4 rounded bg-slate-200" />

                                    <div className="mt-3 h-4 w-2/3 rounded bg-slate-200" />
                                </div>
                            )
                        )}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:py-12">

            {/* =====================================================
                HERO
            ====================================================== */}

            <motion.div
                initial={{
                    opacity: 0,
                    y: 20,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                transition={{
                    duration: 0.6,
                    ease: "easeOut",
                }}
                className="
                    relative
                    overflow-hidden
                    rounded-[34px]
                    border
                    border-slate-800/30
                    bg-slate-950
                    text-white
                    shadow-[0_30px_80px_rgba(15,23,42,0.16)]
                "
            >
                {/* Ambient glows */}

                <motion.div
                    animate={{
                        x: [0, 25, 0],
                        y: [0, -20, 0],
                        scale: [1, 1.08, 1],
                    }}
                    transition={{
                        duration: 10,
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
                        bg-blue-500/20
                        blur-3xl
                    "
                />

                <motion.div
                    animate={{
                        x: [0, -20, 0],
                        y: [0, 20, 0],
                        scale: [1, 1.08, 1],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="
                        pointer-events-none
                        absolute
                        -bottom-28
                        -left-24
                        h-96
                        w-96
                        rounded-full
                        bg-cyan-400/15
                        blur-3xl
                    "
                />

                {/* Grid texture */}

                <div
                    className="
                        pointer-events-none
                        absolute
                        inset-0
                        opacity-20
                        [background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)]
                        [background-size:36px_36px]
                        [mask-image:linear-gradient(to_bottom,black,transparent)]
                    "
                />

                <div
                    className="
                        relative
                        z-10
                        grid
                        gap-10
                        px-7
                        py-10
                        sm:px-10
                        sm:py-12
                        lg:grid-cols-[1.15fr_0.85fr]
                        lg:px-14
                        lg:py-14
                    "
                >

                    {/* Left */}

                    <div>
                        <motion.div
                            initial={{
                                opacity: 0,
                                y: 10,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                delay: 0.08,
                                duration: 0.4,
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
                                text-[11px]
                                font-extrabold
                                uppercase
                                tracking-[0.18em]
                                text-cyan-200
                                backdrop-blur-xl
                            "
                        >
                            <Sparkles size={14} />
                            Study Resources
                        </motion.div>

                        <motion.h1
                            initial={{
                                opacity: 0,
                                y: 15,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                delay: 0.16,
                                duration: 0.55,
                            }}
                            className="
                                mt-6
                                max-w-3xl
                                text-4xl
                                font-black
                                leading-[1.02]
                                tracking-[-0.04em]
                                sm:text-5xl
                                lg:text-6xl
                            "
                        >
                            Explore knowledge.
                            <br />

                            <span
                                className="
                                    bg-gradient-to-r
                                    from-cyan-300
                                    via-sky-300
                                    to-blue-300
                                    bg-clip-text
                                    text-transparent
                                "
                            >
                                One note at a time.
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{
                                opacity: 0,
                                y: 12,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                delay: 0.26,
                                duration: 0.5,
                            }}
                            className="
                                mt-6
                                max-w-2xl
                                text-base
                                leading-7
                                text-slate-300
                                sm:text-lg
                                sm:leading-8
                            "
                        >
                            Discover lecture notes, study
                            materials, academic resources,
                            and shared knowledge from the
                            NoteShare community.
                        </motion.p>

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
                                delay: 0.36,
                                duration: 0.5,
                            }}
                            className="mt-8 flex flex-wrap gap-3"
                        >
                            <div className="
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
                                font-semibold
                                text-slate-200
                                backdrop-blur-xl
                            ">
                                <BookOpen size={16} />
                                Multiple subjects
                            </div>

                            <div className="
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
                                font-semibold
                                text-slate-200
                                backdrop-blur-xl
                            ">
                                <GraduationCap
                                    size={16}
                                />
                                Student powered
                            </div>
                        </motion.div>
                    </div>

                    {/* Right visual */}

                    <div className="flex items-center justify-center lg:justify-end">
                        <motion.div
                            initial={{
                                opacity: 0,
                                scale: 0.92,
                                y: 18,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                            }}
                            transition={{
                                delay: 0.25,
                                duration: 0.65,
                            }}
                            className="relative w-full max-w-sm"
                        >
                            <motion.div
                                animate={{
                                    y: [0, -8, 0],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="
                                    relative
                                    overflow-hidden
                                    rounded-[28px]
                                    border
                                    border-white/10
                                    bg-white/[0.08]
                                    p-5
                                    shadow-2xl
                                    backdrop-blur-2xl
                                "
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="
                                            flex
                                            h-11
                                            w-11
                                            items-center
                                            justify-center
                                            rounded-xl
                                            bg-gradient-to-br
                                            from-blue-500
                                            to-cyan-400
                                        ">
                                            <BookOpen size={21} />
                                        </div>

                                        <div>
                                            <p className="text-sm font-bold text-white">
                                                NoteShare Library
                                            </p>

                                            <p className="text-xs text-slate-400">
                                                Learn. Share. Grow.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="
                                        h-2.5
                                        w-2.5
                                        rounded-full
                                        bg-emerald-400
                                        shadow-[0_0_15px_rgba(52,211,153,0.8)]
                                    " />
                                </div>

                                <div className="mt-6 space-y-3">
                                    {[
                                        {
                                            title: "Lecture Notes",
                                            label: "CSE",
                                        },
                                        {
                                            title: "IDP Proposal",
                                            label: "Project",
                                        },
                                        {
                                            title: "Study Material",
                                            label: "Academic",
                                        },
                                    ].map(
                                        (
                                            item,
                                            index
                                        ) => (
                                            <motion.div
                                                key={
                                                    item.title
                                                }
                                                initial={{
                                                    opacity: 0,
                                                    x: 15,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    x: 0,
                                                }}
                                                transition={{
                                                    delay:
                                                        0.5 +
                                                        index *
                                                            0.12,
                                                }}
                                                className="
                                                    flex
                                                    items-center
                                                    justify-between
                                                    rounded-xl
                                                    border
                                                    border-white/10
                                                    bg-white/5
                                                    px-4
                                                    py-3
                                                "
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-2 w-2 rounded-full bg-cyan-300" />

                                                    <span className="text-sm font-semibold text-slate-200">
                                                        {
                                                            item.title
                                                        }
                                                    </span>
                                                </div>

                                                <span className="
                                                    rounded-full
                                                    bg-white/10
                                                    px-2.5
                                                    py-1
                                                    text-[10px]
                                                    font-bold
                                                    text-slate-300
                                                ">
                                                    {
                                                        item.label
                                                    }
                                                </span>
                                            </motion.div>
                                        )
                                    )}
                                </div>

                                <div className="
                                    mt-5
                                    flex
                                    items-center
                                    justify-between
                                    rounded-xl
                                    bg-gradient-to-r
                                    from-blue-600/30
                                    to-cyan-500/20
                                    px-4
                                    py-3
                                ">
                                    <span className="text-xs font-semibold text-slate-300">
                                        Always growing
                                    </span>

                                    <Sparkles
                                        size={16}
                                        className="text-cyan-300"
                                    />
                                </div>
                            </motion.div>

                            <div className="
                                pointer-events-none
                                absolute
                                -bottom-5
                                -left-5
                                h-20
                                w-20
                                rounded-2xl
                                border
                                border-white/10
                                bg-white/5
                                backdrop-blur-xl
                            " />
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* =====================================================
                SEARCH + FILTERS
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
                    delay: 0.18,
                    duration: 0.55,
                }}
                className="
                    mt-8
                    rounded-[28px]
                    border
                    border-slate-200/80
                    bg-white/90
                    p-4
                    shadow-[0_15px_45px_rgba(15,23,42,0.055)]
                    backdrop-blur-sm
                    sm:p-5
                "
            >
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-xl
                            bg-blue-50
                            text-blue-600
                        ">
                            <Search size={17} />
                        </div>

                        <div>
                            <p className="text-sm font-extrabold text-slate-800">
                                Find a note
                            </p>

                            <p className="hidden text-xs text-slate-400 sm:block">
                                Search by title, subject,
                                department or uploader
                            </p>
                        </div>
                    </div>

                    {(search ||
                        department !== "All") && (
                        <button
                            onClick={clearFilters}
                            className="
                                rounded-lg
                                px-3
                                py-2
                                text-xs
                                font-bold
                                text-red-500
                                transition-colors
                                hover:bg-red-50
                            "
                        >
                            Clear all
                        </button>
                    )}
                </div>

                <div className="grid gap-3 lg:grid-cols-[1fr_220px]">

                    {/* Search */}

                    <div className="relative">
                        <Search
                            size={19}
                            className="
                                pointer-events-none
                                absolute
                                left-4
                                top-1/2
                                -translate-y-1/2
                                text-slate-400
                            "
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(event) => {
                                setSearch(
                                    event.target.value
                                );
                                setPage(1);
                            }}
                            placeholder="Search notes..."
                            className="
                                h-13
                                w-full
                                rounded-xl
                                border
                                border-slate-200
                                bg-slate-50/80
                                pl-11
                                pr-11
                                text-sm
                                font-medium
                                text-slate-700
                                outline-none
                                transition-all
                                duration-200
                                placeholder:text-slate-400
                                focus:border-blue-400
                                focus:bg-white
                                focus:ring-4
                                focus:ring-blue-100/60
                            "
                        />

                        {search && (
                            <button
                                onClick={() => {
                                    setSearch("");
                                    setPage(1);
                                }}
                                className="
                                    absolute
                                    right-3
                                    top-1/2
                                    flex
                                    h-8
                                    w-8
                                    -translate-y-1/2
                                    items-center
                                    justify-center
                                    rounded-lg
                                    bg-slate-200
                                    text-slate-500
                                    transition
                                    hover:bg-slate-300
                                "
                                title="Clear search"
                            >
                                <X size={15} />
                            </button>
                        )}
                    </div>

                    {/* Department */}

                    <div className="relative">
                        <SlidersHorizontal
                            size={17}
                            className="
                                pointer-events-none
                                absolute
                                left-4
                                top-1/2
                                -translate-y-1/2
                                text-slate-400
                            "
                        />

                        <select
                            value={department}
                            onChange={(event) => {
                                setDepartment(
                                    event.target.value
                                );
                                setPage(1);
                            }}
                            className="
                                h-13
                                w-full
                                appearance-none
                                rounded-xl
                                border
                                border-slate-200
                                bg-slate-50/80
                                pl-10
                                pr-4
                                text-sm
                                font-semibold
                                text-slate-700
                                outline-none
                                transition-all
                                duration-200
                                focus:border-blue-400
                                focus:bg-white
                                focus:ring-4
                                focus:ring-blue-100/60
                            "
                        >
                            {departmentOptions.map(
                                (item) => (
                                    <option
                                        key={item}
                                        value={item}
                                    >
                                        {item ===
                                        "All"
                                            ? "All Departments"
                                            : item}
                                    </option>
                                )
                            )}
                        </select>
                    </div>
                </div>

                {/* Active filters */}

                {(search ||
                    department !== "All") && (
                    <div
                        className="
                            mt-4
                            flex
                            flex-wrap
                            items-center
                            gap-2
                            border-t
                            border-slate-100
                            pt-4
                        "
                    >
                        <span className="
                            mr-1
                            text-[10px]
                            font-black
                            uppercase
                            tracking-[0.16em]
                            text-slate-400
                        ">
                            Active
                        </span>

                        {search && (
                            <button
                                onClick={() =>
                                    setSearch("")
                                }
                                className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-full
                                    border
                                    border-blue-100
                                    bg-blue-50
                                    px-3
                                    py-1.5
                                    text-xs
                                    font-bold
                                    text-blue-700
                                "
                            >
                                Search:
                                <span className="max-w-[180px] truncate">
                                    {search}
                                </span>
                                <X size={12} />
                            </button>
                        )}

                        {department !==
                            "All" && (
                            <button
                                onClick={() =>
                                    setDepartment(
                                        "All"
                                    )
                                }
                                className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-full
                                    border
                                    border-violet-100
                                    bg-violet-50
                                    px-3
                                    py-1.5
                                    text-xs
                                    font-bold
                                    text-violet-700
                                "
                            >
                                {department}
                                <X size={12} />
                            </button>
                        )}
                    </div>
                )}
            </motion.div>

            {/* =====================================================
                NOTES HEADER
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
                    delay: 0.25,
                    duration: 0.5,
                }}
                className="
                    mt-14
                    flex
                    flex-col
                    gap-5
                    sm:flex-row
                    sm:items-end
                    sm:justify-between
                "
            >
                <div>
                    <div className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        border
                        border-blue-100
                        bg-blue-50
                        px-3
                        py-1.5
                        text-[10px]
                        font-black
                        uppercase
                        tracking-[0.16em]
                        text-blue-600
                    ">
                        <Layers3 size={13} />
                        Study Collection
                    </div>

                    <h2 className="
                        mt-4
                        text-3xl
                        font-black
                        tracking-tight
                        text-slate-900
                        sm:text-4xl
                    ">
                        Explore Notes
                    </h2>

                    <p className="
                        mt-2
                        text-sm
                        leading-6
                        text-slate-500
                        sm:text-base
                    ">
                        Find the material you need and
                        get back to learning faster.
                    </p>
                </div>

                <div className="
                    inline-flex
                    w-fit
                    items-center
                    gap-2
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    py-3
                    text-sm
                    font-bold
                    text-slate-600
                    shadow-sm
                ">
                    <Filter
                        size={16}
                        className="text-blue-600"
                    />

                    {filteredNotes.length}
                    {" "}
                    matching notes
                </div>
            </motion.div>

            {/* =====================================================
                NOTES GRID
            ====================================================== */}

            {filteredNotes.length === 0 ? (
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
                        duration: 0.45,
                    }}
                    className="
                        mt-8
                        rounded-[30px]
                        border
                        border-dashed
                        border-slate-300
                        bg-white
                        px-6
                        py-16
                        text-center
                        shadow-sm
                    "
                >
                    <div className="
                        mx-auto
                        flex
                        h-20
                        w-20
                        items-center
                        justify-center
                        rounded-3xl
                        bg-gradient-to-br
                        from-blue-50
                        to-cyan-50
                        text-blue-600
                        shadow-sm
                    ">
                        <BookOpen size={34} />
                    </div>

                    <h3 className="
                        mt-6
                        text-2xl
                        font-black
                        text-slate-800
                    ">
                        No notes found
                    </h3>

                    <p className="
                        mx-auto
                        mt-3
                        max-w-md
                        text-sm
                        leading-6
                        text-slate-500
                    ">
                        Try a different keyword or
                        select another department to
                        discover more study materials.
                    </p>

                    {(search ||
                        department !== "All") && (
                        <motion.button
                            whileHover={{
                                y: -2,
                            }}
                            whileTap={{
                                scale: 0.98,
                            }}
                            onClick={
                                clearFilters
                            }
                            className="
                                mt-7
                                rounded-xl
                                bg-blue-600
                                px-6
                                py-3
                                text-sm
                                font-bold
                                text-white
                                shadow-lg
                                shadow-blue-500/20
                                transition
                                hover:bg-blue-700
                            "
                        >
                            Clear filters
                        </motion.button>
                    )}
                </motion.div>
            ) : (
                <div className="mt-8 grid gap-6 md:grid-cols-2">
                    {filteredNotes.map(
                        (note, index) => (
                            <motion.div
                                key={note.id}
                                initial={{
                                    opacity: 0,
                                    y: 22,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                transition={{
                                    duration: 0.45,
                                    delay:
                                        (index % 4) *
                                        0.06,
                                    ease: "easeOut",
                                }}
                                whileHover={{
                                    y: -4,
                                }}
                            >
                                <NoteCard
                                    note={note}
                                />
                            </motion.div>
                        )
                    )}
                </div>
            )}

            {/* =====================================================
                PAGINATION
            ====================================================== */}

            {totalPages > 1 && (
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 15,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.45,
                        delay: 0.15,
                    }}
                    className="
                        mt-10
                        flex
                        items-center
                        justify-center
                        gap-3
                    "
                >
                    <motion.button
                        whileHover={
                            page > 1
                                ? { y: -2 }
                                : {}
                        }
                        whileTap={
                            page > 1
                                ? { scale: 0.96 }
                                : {}
                        }
                        onClick={
                            previousPage
                        }
                        disabled={
                            page === 1
                        }
                        className="
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            text-slate-700
                            shadow-sm
                            transition
                            hover:border-blue-200
                            hover:bg-blue-50
                            hover:text-blue-600
                            disabled:cursor-not-allowed
                            disabled:opacity-35
                        "
                        title="Previous page"
                    >
                        <ChevronLeft size={19} />
                    </motion.button>

                    <div
                        className="
                            flex
                            h-11
                            items-center
                            gap-2
                            rounded-xl
                            border
                            border-slate-200
                            bg-slate-50
                            px-5
                            text-sm
                            font-bold
                            text-slate-600
                        "
                    >
                        <span className="text-blue-600">
                            {page}
                        </span>

                        <span>/</span>

                        <span>
                            {totalPages}
                        </span>
                    </div>

                    <motion.button
                        whileHover={
                            page < totalPages
                                ? { y: -2 }
                                : {}
                        }
                        whileTap={
                            page < totalPages
                                ? { scale: 0.96 }
                                : {}
                        }
                        onClick={nextPage}
                        disabled={
                            page === totalPages
                        }
                        className="
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-xl
                            bg-blue-600
                            text-white
                            shadow-lg
                            shadow-blue-500/20
                            transition
                            hover:bg-blue-700
                            disabled:cursor-not-allowed
                            disabled:opacity-35
                        "
                        title="Next page"
                    >
                        <ChevronRight size={19} />
                    </motion.button>
                </motion.div>
            )}

            {/* =====================================================
                UPLOAD CTA
            ====================================================== */}

            <motion.section
                initial={{
                    opacity: 0,
                    y: 24,
                }}
                whileInView={{
                    opacity: 1,
                    y: 0,
                }}
                viewport={{
                    once: true,
                    amount: 0.15,
                }}
                transition={{
                    duration: 0.6,
                }}
                className="mt-16"
            >
                <div
                    className="
                        relative
                        overflow-hidden
                        rounded-[30px]
                        bg-gradient-to-r
                        from-blue-600
                        via-blue-700
                        to-cyan-600
                        p-7
                        text-white
                        shadow-[0_25px_60px_rgba(37,99,235,0.20)]
                        sm:p-9
                        lg:p-10
                    "
                >
                    <motion.div
                        animate={{
                            x: [0, 25, 0],
                            y: [0, -15, 0],
                            scale: [1, 1.08, 1],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="
                            pointer-events-none
                            absolute
                            -right-16
                            -top-16
                            h-56
                            w-56
                            rounded-full
                            bg-white/10
                            blur-3xl
                        "
                    />

                    <div className="
                        relative
                        flex
                        flex-col
                        gap-7
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                    ">
                        <div>
                            <div className="
                                inline-flex
                                items-center
                                gap-2
                                text-xs
                                font-bold
                                uppercase
                                tracking-[0.16em]
                                text-blue-100
                            ">
                                <Sparkles size={14} />
                                Keep sharing
                            </div>

                            <h3 className="
                                mt-3
                                text-2xl
                                font-black
                                tracking-tight
                                sm:text-3xl
                            ">
                                Have useful notes?
                            </h3>

                            <p className="
                                mt-2
                                max-w-2xl
                                text-sm
                                leading-6
                                text-blue-100
                                sm:text-base
                            ">
                                Share your study resources
                                and help another student learn
                                a little faster.
                            </p>
                        </div>

                        <Link
                            to="/upload"
                            className="
                                group
                                inline-flex
                                shrink-0
                                items-center
                                justify-center
                                gap-2.5
                                rounded-2xl
                                bg-white
                                px-6
                                py-3.5
                                text-sm
                                font-extrabold
                                text-blue-700
                                shadow-xl
                                transition-all
                                duration-300
                                hover:-translate-y-1
                                hover:shadow-2xl
                            "
                        >
                            <Upload size={18} />
                            Upload a Note

                            <ArrowUpRight
                                size={17}
                                className="
                                    transition-transform
                                    duration-300
                                    group-hover:translate-x-0.5
                                    group-hover:-translate-y-0.5
                                "
                            />
                        </Link>
                    </div>
                </div>
            </motion.section>
        </section>
    );
}

export default Notes;