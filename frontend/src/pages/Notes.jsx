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
    ArrowUpRight,
    Filter,
    FileText,
    GraduationCap,
    School,
} from "lucide-react";

import {
    Link,
    useSearchParams,
} from "react-router-dom";

import API from "../services/api";
import NoteCard from "../components/NoteCard";

function Notes() {
    const [searchParams, setSearchParams] =
        useSearchParams();

    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState(
        searchParams.get("search") || ""
    );

    const [educationLevel, setEducationLevel] =
        useState("All");

    const [department, setDepartment] =
        useState("All");

    const [classLevel, setClassLevel] =
        useState("All");

    const [board, setBoard] =
        useState("All");

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] =
        useState(1);

    const departmentOptions = [
        "All",
        "CSE",
        "EEE",
        "Civil",
        "Architecture",
        "Textile",
        "BBA",
        "English",
        "Law",
    ];

    const classOptions = [
        "All",
        "Class 1",
        "Class 2",
        "Class 3",
        "Class 4",
        "Class 5",
        "Class 6",
        "Class 7",
        "Class 8",
        "Class 9",
        "Class 10",
        "Class 11",
        "Class 12",
    ];

    const boardOptions = [
        "All",
        "NCTB",
        "English Version",
        "Cambridge",
        "Edexcel",
        "Madrasa",
    ];

    /* =========================================================
       LOAD NOTES
    ========================================================= */

    useEffect(() => {
        let mounted = true;

        const loadNotes = async () => {
            setLoading(true);

            try {
                const searchQuery =
                    searchParams.get("search") || "";

                /*
                 * Load all pages when searching or filtering,
                 * so filters can work across the complete
                 * available note collection.
                 */
                const hasFilters =
                    searchQuery.trim() ||
                    educationLevel !== "All" ||
                    department !== "All" ||
                    classLevel !== "All" ||
                    board !== "All";

                if (!hasFilters) {
                    const response =
                        await API.get(
                            `notes/?page=${page}`
                        );

                    if (!mounted) {
                        return;
                    }

                    const data =
                        response?.data || {};

                    const receivedNotes =
                        Array.isArray(
                            data.notes
                        )
                            ? data.notes
                            : [];

                    setNotes(
                        receivedNotes
                    );

                    setTotalPages(
                        Number(
                            data.total_pages
                        ) || 1
                    );

                    return;
                }

                const firstResponse =
                    await API.get(
                        "notes/?page=1"
                    );

                if (!mounted) {
                    return;
                }

                const firstData =
                    firstResponse?.data || {};

                const totalPagesFromAPI =
                    Number(
                        firstData.total_pages
                    ) || 1;

                let allNotes =
                    Array.isArray(
                        firstData.notes
                    )
                        ? firstData.notes
                        : [];

                if (
                    totalPagesFromAPI > 1
                ) {
                    const pageRequests =
                        Array.from(
                            {
                                length:
                                    totalPagesFromAPI -
                                    1,
                            },
                            (_, index) =>
                                API.get(
                                    `notes/?page=${
                                        index + 2
                                    }`
                                )
                        );

                    const responses =
                        await Promise.all(
                            pageRequests
                        );

                    if (!mounted) {
                        return;
                    }

                    responses.forEach(
                        (response) => {
                            const data =
                                response?.data ||
                                {};

                            if (
                                Array.isArray(
                                    data.notes
                                )
                            ) {
                                allNotes = [
                                    ...allNotes,
                                    ...data.notes,
                                ];
                            }
                        }
                    );
                }

                if (!mounted) {
                    return;
                }

                setNotes(allNotes);

                /*
                 * Search/filter results are shown together,
                 * therefore pagination is disabled while
                 * any active search/filter is being used.
                 */
                setTotalPages(1);
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
    }, [
        page,
        searchParams,
        educationLevel,
        department,
        classLevel,
        board,
    ]);

    /* =========================================================
       SYNC SEARCH WITH URL
    ========================================================= */

    useEffect(() => {
        const query =
            searchParams.get("search") || "";

        setSearch(query);
        setPage(1);
    }, [searchParams]);

    /* =========================================================
       FILTER NOTES
    ========================================================= */

    const filteredNotes =
        notes.filter((note) => {
            const keyword =
                search
                    .toLowerCase()
                    .trim();

            const title =
                (
                    note?.title || ""
                ).toLowerCase();

            const description =
                (
                    note?.description || ""
                ).toLowerCase();

            const dept =
                (
                    note?.department || ""
                ).toLowerCase();

            const uploader =
                (
                    note?.uploader_name ||
                    ""
                ).toLowerCase();

            const subject =
                (
                    note?.subject || ""
                ).toLowerCase();

            const chapter =
                (
                    note?.chapter || ""
                ).toLowerCase();

            const course =
                (
                    note?.course || ""
                ).toLowerCase();

            const searchMatch =
                !keyword ||
                title.includes(keyword) ||
                description.includes(keyword) ||
                dept.includes(keyword) ||
                uploader.includes(keyword) ||
                subject.includes(keyword) ||
                chapter.includes(keyword) ||
                course.includes(keyword);

            const noteEducationLevel =
                (
                    note?.education_level ||
                    "university"
                ).toLowerCase();

            const educationMatch =
                educationLevel ===
                    "All" ||
                (educationLevel ===
                    "University" &&
                    noteEducationLevel ===
                        "university") ||
                (educationLevel ===
                    "School & College" &&
                    noteEducationLevel ===
                        "school");

            const departmentMatch =
                educationLevel !==
                    "University" ||
                department === "All" ||
                note?.department ===
                    department;

            const classMatch =
                educationLevel !==
                    "School & College" ||
                classLevel === "All" ||
                note?.class_level ===
                    classLevel;

            const boardMatch =
                educationLevel !==
                    "School & College" ||
                board === "All" ||
                note?.board === board;

            return (
                searchMatch &&
                educationMatch &&
                departmentMatch &&
                classMatch &&
                boardMatch
            );
        });

    /* =========================================================
       CLEAR FILTERS
    ========================================================= */

    const clearFilters = () => {
        setSearch("");
        setEducationLevel("All");
        setDepartment("All");
        setClassLevel("All");
        setBoard("All");
        setPage(1);
        setSearchParams({});
    };

    /* =========================================================
       EDUCATION LEVEL CHANGE
    ========================================================= */

    const handleEducationLevelChange = (
        value
    ) => {
        setEducationLevel(value);
        setPage(1);

        if (value === "University") {
            setClassLevel("All");
            setBoard("All");
        }

        if (
            value ===
            "School & College"
        ) {
            setDepartment("All");
        }

        if (value === "All") {
            setDepartment("All");
            setClassLevel("All");
            setBoard("All");
        }
    };

    /* =========================================================
       PAGINATION
    ========================================================= */

    const previousPage = () => {
        setPage((current) =>
            Math.max(
                current - 1,
                1
            )
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

    const hasActiveFilters =
        Boolean(search) ||
        educationLevel !== "All" ||
        department !== "All" ||
        classLevel !== "All" ||
        board !== "All";

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <section className="
            mx-auto
            max-w-7xl
            px-4
            py-6
            sm:px-6
            sm:py-10
        ">

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

                <div className="
                    pointer-events-none
                    absolute
                    -right-24
                    -top-24
                    h-96
                    w-96
                    rounded-full
                    bg-cyan-400/15
                    blur-3xl
                " />

                <div className="
                    pointer-events-none
                    absolute
                    -bottom-32
                    -left-24
                    h-96
                    w-96
                    rounded-full
                    bg-blue-500/15
                    blur-3xl
                " />

                <div className="
                    pointer-events-none
                    absolute
                    right-1/3
                    top-1/3
                    h-48
                    w-48
                    rounded-full
                    bg-indigo-400/10
                    blur-3xl
                " />

                <div className="
                    relative
                    flex
                    flex-col
                    gap-8
                    lg:flex-row
                    lg:items-end
                    lg:justify-between
                ">

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
                            <Sparkles
                                size={14}
                            />

                            NoteShare Knowledge Hub
                        </motion.div>

                        <h1 className="
                            mt-6
                            text-4xl
                            font-black
                            tracking-tight
                            sm:text-5xl
                            lg:text-6xl
                        ">
                            Study Notes
                        </h1>

                        <p className="
                            mt-4
                            max-w-2xl
                            text-base
                            leading-7
                            text-slate-300
                            sm:text-lg
                            sm:leading-8
                        ">
                            Explore, share and discover
                            useful academic notes from
                            the NoteShare community.
                        </p>

                        <div className="
                            mt-7
                            flex
                            flex-wrap
                            gap-3
                        ">

                            <div className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-full
                                border
                                border-white/10
                                bg-white/5
                                px-4
                                py-2.5
                                text-sm
                                font-semibold
                                text-slate-300
                                backdrop-blur-sm
                            ">
                                <BookOpen
                                    size={16}
                                />

                                {loading
                                    ? "Loading..."
                                    : `${notes.length} Study Notes`}
                            </div>

                            <div className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-full
                                border
                                border-white/10
                                bg-white/5
                                px-4
                                py-2.5
                                text-sm
                                font-semibold
                                text-slate-300
                                backdrop-blur-sm
                            ">
                                <FileText
                                    size={16}
                                />

                                Academic Resources
                            </div>

                        </div>
                    </div>

                    {/* Upload button */}

                    <motion.div
                        whileHover={{
                            y: -2,
                        }}
                        whileTap={{
                            scale: 0.98,
                        }}
                    >
                        <Link
                            to="/upload"
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
                            <Upload
                                size={19}
                            />

                            Upload Note

                            <ArrowUpRight
                                size={18}
                                className="
                                    transition-transform
                                    duration-300
                                    group-hover:translate-x-0.5
                                    group-hover:-translate-y-0.5
                                "
                            />
                        </Link>
                    </motion.div>

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
                    notes-search-panel
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

                <div className="
                    mb-4
                    flex
                    items-center
                    justify-between
                    gap-3
                ">

                    <div className="
                        flex
                        items-center
                        gap-2.5
                    ">

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
                            <Search
                                size={17}
                            />
                        </div>

                        <div>

                            <p className="
                                text-sm
                                font-extrabold
                                text-slate-800
                            ">
                                Find a note
                            </p>

                            <p className="
                                hidden
                                text-xs
                                text-slate-400
                                sm:block
                            ">
                                Search by title, subject,
                                chapter, course or uploader
                            </p>

                        </div>
                    </div>

                    {hasActiveFilters && (
                        <button
                            onClick={
                                clearFilters
                            }
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

                {/* Search */}

                <div className="
                    relative
                ">

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
                        onChange={(
                            event
                        ) => {
                            setSearch(
                                event
                                    .target
                                    .value
                            );

                            setPage(1);
                        }}
                        placeholder="Search notes, subjects, chapters, courses..."
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

                {/* =================================================
                    EDUCATION FILTER
                ================================================== */}

                <div className="
                    mt-4
                    grid
                    gap-3
                    md:grid-cols-2
                ">

                    {/* Education Level */}

                    <div className="
                        relative
                    ">

                        <GraduationCap
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
                            value={
                                educationLevel
                            }
                            onChange={(
                                event
                            ) =>
                                handleEducationLevelChange(
                                    event
                                        .target
                                        .value
                                )
                            }
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
                            <option value="All">
                                All Education Levels
                            </option>

                            <option value="School & College">
                                School & College
                            </option>

                            <option value="University">
                                University
                            </option>
                        </select>

                    </div>

                    {/* Contextual Filter */}

                    {educationLevel ===
                        "University" ? (

                        <div className="
                            relative
                        ">

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
                                value={
                                    department
                                }
                                onChange={(
                                    event
                                ) => {
                                    setDepartment(
                                        event
                                            .target
                                            .value
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
                                            key={
                                                item
                                            }
                                            value={
                                                item
                                            }
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

                    ) : educationLevel ===
                      "School & College" ? (

                        <div className="
                            relative
                        ">

                            <School
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
                                value={
                                    classLevel
                                }
                                onChange={(
                                    event
                                ) => {
                                    setClassLevel(
                                        event
                                            .target
                                            .value
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
                                    focus:border-cyan-400
                                    focus:bg-white
                                    focus:ring-4
                                    focus:ring-cyan-100/60
                                "
                            >
                                {classOptions.map(
                                    (item) => (
                                        <option
                                            key={
                                                item
                                            }
                                            value={
                                                item
                                            }
                                        >
                                            {item ===
                                            "All"
                                                ? "All Classes"
                                                : item}
                                        </option>
                                    )
                                )}
                            </select>

                        </div>

                    ) : (

                        <div className="
                            flex
                            h-13
                            items-center
                            gap-3
                            rounded-xl
                            border
                            border-slate-200
                            bg-slate-50/70
                            px-4
                            text-sm
                            font-semibold
                            text-slate-500
                        ">

                            <Layers3
                                size={17}
                                className="text-blue-500"
                            />

                            <span>
                                Choose an education level to refine results
                            </span>

                        </div>

                    )}

                </div>

                {/* =================================================
                    SCHOOL BOARD FILTER
                ================================================== */}

                {educationLevel ===
                    "School & College" && (
                    <div className="
                        mt-3
                        grid
                        gap-3
                        md:grid-cols-2
                    ">

                        <div className="
                            relative
                        ">

                            <Layers3
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
                                value={
                                    board
                                }
                                onChange={(
                                    event
                                ) => {
                                    setBoard(
                                        event
                                            .target
                                            .value
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
                                    focus:border-cyan-400
                                    focus:bg-white
                                    focus:ring-4
                                    focus:ring-cyan-100/60
                                "
                            >
                                {boardOptions.map(
                                    (item) => (
                                        <option
                                            key={
                                                item
                                            }
                                            value={
                                                item
                                            }
                                        >
                                            {item ===
                                            "All"
                                                ? "All Boards / Curriculums"
                                                : item}
                                        </option>
                                    )
                                )}
                            </select>

                        </div>

                        <div className="
                            flex
                            h-13
                            items-center
                            gap-3
                            rounded-xl
                            border
                            border-cyan-100
                            bg-cyan-50/60
                            px-4
                            text-xs
                            font-semibold
                            text-cyan-700
                        ">

                            <BookOpen
                                size={17}
                            />

                            Search by subject or chapter
                            to discover specific study materials.

                        </div>

                    </div>
                )}

                {/* Active filters */}

                {hasActiveFilters && (
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

                                <span className="
                                    max-w-[180px]
                                    truncate
                                ">
                                    {search}
                                </span>

                                <X
                                    size={12}
                                />
                            </button>
                        )}

                        {educationLevel !==
                            "All" && (
                            <button
                                onClick={() => {
                                    handleEducationLevelChange(
                                        "All"
                                    );
                                }}
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
                                {educationLevel}

                                <X
                                    size={12}
                                />
                            </button>
                        )}

                        {educationLevel ===
                            "University" &&
                            department !==
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

                                    <X
                                        size={12}
                                    />
                                </button>
                            )}

                        {educationLevel ===
                            "School & College" &&
                            classLevel !==
                                "All" && (
                                <button
                                    onClick={() =>
                                        setClassLevel(
                                            "All"
                                        )
                                    }
                                    className="
                                        inline-flex
                                        items-center
                                        gap-2
                                        rounded-full
                                        border
                                        border-cyan-100
                                        bg-cyan-50
                                        px-3
                                        py-1.5
                                        text-xs
                                        font-bold
                                        text-cyan-700
                                    "
                                >
                                    {classLevel}

                                    <X
                                        size={12}
                                    />
                                </button>
                            )}

                        {educationLevel ===
                            "School & College" &&
                            board !==
                                "All" && (
                                <button
                                    onClick={() =>
                                        setBoard(
                                            "All"
                                        )
                                    }
                                    className="
                                        inline-flex
                                        items-center
                                        gap-2
                                        rounded-full
                                        border
                                        border-emerald-100
                                        bg-emerald-50
                                        px-3
                                        py-1.5
                                        text-xs
                                        font-bold
                                        text-emerald-700
                                    "
                                >
                                    {board}

                                    <X
                                        size={12}
                                    />
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
                    notes-result-count
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
                NOTES
            ====================================================== */}

            {loading ? (

                <div className="
                    mt-8
                    grid
                    gap-6
                    md:grid-cols-2
                ">

                    {[1, 2, 3, 4].map(
                        (item) => (
                            <div
                                key={item}
                                className="
                                    h-64
                                    animate-pulse
                                    rounded-[28px]
                                    border
                                    border-slate-200
                                    bg-slate-100
                                "
                            />
                        )
                    )}

                </div>

            ) : filteredNotes.length ===
              0 ? (

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
                        notes-empty-state
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
                        <BookOpen
                            size={34}
                        />
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
                        {educationLevel ===
                            "School & College"
                            ? "Try another class, board or search term to discover school and college resources."
                            : educationLevel ===
                              "University"
                            ? "Try another department or search term to discover university resources."
                            : "Try a different keyword or education level to discover more study materials."}
                    </p>

                    {hasActiveFilters && (
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

                <div className="
                    mt-8
                    grid
                    gap-6
                    md:grid-cols-2
                ">

                    {filteredNotes.map(
                        (
                            note,
                            index
                        ) => (
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
                                        (index %
                                            4) *
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

            {!loading &&
                totalPages > 1 && (
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
                            notes-pagination
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
                                    ? {
                                          y: -2,
                                      }
                                    : {}
                            }
                            whileTap={
                                page > 1
                                    ? {
                                          scale: 0.96,
                                      }
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
                            <ChevronLeft
                                size={19}
                            />
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

                            <span className="
                                text-blue-600
                            ">
                                {page}
                            </span>

                            <span>/</span>

                            <span>
                                {totalPages}
                            </span>

                        </div>

                        <motion.button
                            whileHover={
                                page <
                                totalPages
                                    ? {
                                          y: -2,
                                      }
                                    : {}
                            }
                            whileTap={
                                page <
                                totalPages
                                    ? {
                                          scale: 0.96,
                                      }
                                    : {}
                            }
                            onClick={
                                nextPage
                            }
                            disabled={
                                page ===
                                totalPages
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
                            <ChevronRight
                                size={19}
                            />
                        </motion.button>

                    </motion.div>
                )}

        </section>
    );
}

export default Notes;