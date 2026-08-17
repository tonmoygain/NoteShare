import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

import {
    ArrowRight,
    BookOpen,
    Users,
    GraduationCap,
    FileText,
    Sparkles,
    ShieldCheck,
    BrainCircuit,
} from "lucide-react";

import API from "../services/api";


function Hero() {

    const [stats, setStats] = useState({
        notes: 0,
        students: 0,
        departments: 0,
        blogs: 0,
    });

    const [loading, setLoading] = useState(true);


    useEffect(() => {
    const loadStats = async () => {
        try {
            // ==========================================
            // FETCH FIRST NOTES PAGE
            // ==========================================

            const firstNotesResponse = await API.get(
                "notes/?page=1"
            );

            const firstNotesData =
                firstNotesResponse?.data || {};

            const firstNotes =
                Array.isArray(firstNotesData.notes)
                    ? firstNotesData.notes
                    : [];

            const totalPages =
                Number(firstNotesData.total_pages) || 1;

            // ==========================================
            // FETCH REMAINING NOTE PAGES
            // ==========================================

            let allNotes = [...firstNotes];

            if (totalPages > 1) {
                const remainingPages = await Promise.all(
                    Array.from(
                        { length: totalPages - 1 },
                        (_, index) =>
                            API.get(
                                `notes/?page=${index + 2}`
                            )
                    )
                );

                remainingPages.forEach((response) => {
                    const pageData =
                        response?.data || {};

                    if (Array.isArray(pageData.notes)) {
                        allNotes.push(
                            ...pageData.notes
                        );
                    }
                });
            }

            // ==========================================
            // FETCH BLOGS
            // ==========================================

            const blogsResponse =
                await API.get("blogs/");

            const blogsData =
                blogsResponse?.data;

            const allBlogs =
                Array.isArray(blogsData)
                    ? blogsData
                    : Array.isArray(blogsData?.blogs)
                        ? blogsData.blogs
                        : Array.isArray(blogsData?.results)
                            ? blogsData.results
                            : [];

            // ==========================================
            // UNIQUE STUDENTS / UPLOADERS
            // ==========================================

            const students = new Set();

            allNotes.forEach((note) => {
                if (note?.uploader) {
                    students.add(
                        String(note.uploader)
                    );
                    return;
                }

                if (note?.uploader_name) {
                    students.add(
                        note.uploader_name
                    );
                }
            });

            // ==========================================
            // UNIQUE DEPARTMENTS
            // ==========================================

            const departments = new Set();

            allNotes.forEach((note) => {
                if (note?.department) {
                    departments.add(
                        note.department
                    );
                }
            });

            // ==========================================
            // FINAL STATS
            // ==========================================

            setStats({
                notes: allNotes.length,
                students: students.size,
                departments: departments.size,
                blogs: allBlogs.length,
            });

        } catch (error) {
            console.error(
                "Failed to load Hero statistics:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    loadStats();
}, []);

        


    const statsData = [

        {
            icon: (
                <BookOpen
                    size={22}
                    strokeWidth={2.2}
                />
            ),
            value: stats.notes,
            label: "Study Notes",
        },

        {
            icon: (
                <Users
                    size={22}
                    strokeWidth={2.2}
                />
            ),
            value: stats.students,
            label: "Students",
        },

        {
            icon: (
                <GraduationCap
                    size={22}
                    strokeWidth={2.2}
                />
            ),
            value: stats.departments,
            label: "Departments",
        },

        {
            icon: (
                <FileText
                    size={22}
                    strokeWidth={2.2}
                />
            ),
            value: stats.blogs,
            label: "Academic Blogs",
        },

    ];


    return (

        <section
            className="
                relative
                mx-auto
                max-w-7xl
                px-5
                pt-6
                sm:px-6
                lg:px-8
                lg:pt-8
            "
        >

            <motion.div
                initial={{
                    opacity: 0,
                    y: 22,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                transition={{
                    duration: 0.65,
                    ease: "easeOut",
                }}
                className="
                    relative
                    overflow-hidden
                    rounded-[34px]
                    border
                    border-slate-800/30
                    bg-slate-950
                    shadow-[0_30px_80px_rgba(15,23,42,0.20)]
                "
            >

                {/* ==========================================
                    BACKGROUND GLOWS
                ========================================== */}

                <motion.div
                    animate={{
                        x: [0, 35, 0],
                        y: [0, -25, 0],
                        scale: [1, 1.08, 1],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="
                        absolute
                        -right-28
                        -top-32
                        h-[420px]
                        w-[420px]
                        rounded-full
                        bg-cyan-400/20
                        blur-3xl
                    "
                />

                <motion.div
                    animate={{
                        x: [0, -30, 0],
                        y: [0, 30, 0],
                        scale: [1, 1.12, 1],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="
                        absolute
                        -bottom-40
                        -left-28
                        h-[440px]
                        w-[440px]
                        rounded-full
                        bg-blue-600/25
                        blur-3xl
                    "
                />

                <div
                    className="
                        absolute
                        inset-0
                        bg-[radial-gradient(circle_at_30%_20%,rgba(37,99,235,0.18),transparent_32%),radial-gradient(circle_at_85%_75%,rgba(6,182,212,0.14),transparent_28%)]
                    "
                />


                {/* ==========================================
                    CONTENT
                ========================================== */}

                <div
                    className="
                        relative
                        grid
                        gap-12
                        px-6
                        py-10
                        sm:px-10
                        sm:py-14
                        lg:grid-cols-[1.15fr_0.85fr]
                        lg:px-14
                        lg:py-16
                    "
                >

                    {/* ==========================================
                        LEFT
                    ========================================== */}

                    <div
                        className="
                            flex
                            max-w-3xl
                            flex-col
                            justify-center
                        "
                    >

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
                                delay: 0.12,
                                duration: 0.45,
                            }}
                            className="
                                inline-flex
                                w-fit
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
                                uppercase
                                tracking-[0.16em]
                                text-cyan-200
                                backdrop-blur-xl
                            "
                        >

                            <Sparkles
                                size={14}
                            />

                            Academic Resource Platform

                        </motion.div>


                        <motion.h1
                            initial={{
                                opacity: 0,
                                y: 18,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                delay: 0.2,
                                duration: 0.6,
                            }}
                            className="
                                mt-7
                                max-w-3xl
                                text-4xl
                                font-black
                                leading-[1.05]
                                tracking-[-0.04em]
                                text-white
                                sm:text-5xl
                                lg:text-7xl
                            "
                        >

                            Share. Learn.
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
                                Grow Together.
                            </span>

                        </motion.h1>


                        <motion.p
                            initial={{
                                opacity: 0,
                                y: 15,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                delay: 0.3,
                                duration: 0.55,
                            }}
                            className="
                                mt-7
                                max-w-2xl
                                text-base
                                leading-7
                                text-slate-300
                                sm:text-lg
                                sm:leading-8
                            "
                        >

                            Discover study notes, share knowledge,
                            publish academic blogs, and explore your
                            learning resources in one modern student
                            platform.

                        </motion.p>


                        {/* ==========================================
                            ACTIONS
                        ========================================== */}

                        <motion.div
                            initial={{
                                opacity: 0,
                                y: 14,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                delay: 0.4,
                                duration: 0.5,
                            }}
                            className="
                                mt-9
                                flex
                                flex-wrap
                                gap-3
                            "
                        >

                            <Link
                                to="/notes"
                                className="
                                    group
                                    inline-flex
                                    items-center
                                    gap-2.5
                                    rounded-xl
                                    bg-white
                                    px-6
                                    py-3.5
                                    text-sm
                                    font-extrabold
                                    text-blue-700
                                    shadow-xl
                                    shadow-black/10
                                    transition-all
                                    duration-300
                                    hover:-translate-y-1
                                    hover:shadow-2xl
                                "
                            >

                                Explore Notes

                                <ArrowRight
                                    size={18}
                                    className="
                                        transition-transform
                                        duration-300
                                        group-hover:translate-x-1
                                    "
                                />

                            </Link>


                            <Link
                                to="/blogs"
                                className="
                                    inline-flex
                                    items-center
                                    gap-2.5
                                    rounded-xl
                                    border
                                    border-white/15
                                    bg-white/5
                                    px-6
                                    py-3.5
                                    text-sm
                                    font-bold
                                    text-white
                                    backdrop-blur-xl
                                    transition-all
                                    duration-300
                                    hover:-translate-y-1
                                    hover:bg-white/10
                                "
                            >

                                Read Academic Blogs

                            </Link>

                        </motion.div>


                        {/* ==========================================
                            TRUST LINE
                        ========================================== */}

                        <motion.div
                            initial={{
                                opacity: 0,
                            }}
                            animate={{
                                opacity: 1,
                            }}
                            transition={{
                                delay: 0.55,
                                duration: 0.5,
                            }}
                            className="
                                mt-8
                                flex
                                flex-wrap
                                items-center
                                gap-x-5
                                gap-y-2
                                text-xs
                                font-semibold
                                text-slate-400
                            "
                        >

                            <span className="flex items-center gap-1.5">
                                <ShieldCheck
                                    size={15}
                                    className="text-emerald-400"
                                />
                                Secure sharing
                            </span>

                            <span className="flex items-center gap-1.5">
                                <BrainCircuit
                                    size={15}
                                    className="text-cyan-400"
                                />
                                AI-powered assistance
                            </span>

                            <span className="flex items-center gap-1.5">
                                <BookOpen
                                    size={15}
                                    className="text-blue-400"
                                />
                                Student focused
                            </span>

                        </motion.div>

                    </div>


                    {/* ==========================================
                        RIGHT STATS
                    ========================================== */}

                    <div
                        className="
                            flex
                            items-center
                            justify-center
                            lg:justify-end
                        "
                    >

                        <div
                            className="
                                grid
                                w-full
                                max-w-xl
                                grid-cols-2
                                gap-3
                                sm:gap-4
                            "
                        >

                            {statsData.map(
                                (item, index) => (

                                    <motion.div
                                        key={item.label}
                                        initial={{
                                            opacity: 0,
                                            y: 18,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                        }}
                                        transition={{
                                            delay:
                                                0.22 +
                                                index * 0.08,
                                            duration: 0.5,
                                        }}
                                        whileHover={{
                                            y: -5,
                                            scale: 1.015,
                                        }}
                                        className="
                                            group
                                            relative
                                            overflow-hidden
                                            rounded-2xl
                                            border
                                            border-white/10
                                            bg-white/[0.07]
                                            p-5
                                            backdrop-blur-xl
                                            transition-colors
                                            duration-300
                                            hover:bg-white/[0.11]
                                            sm:p-6
                                        "
                                    >

                                        <div
                                            className="
                                                absolute
                                                -right-8
                                                -top-8
                                                h-24
                                                w-24
                                                rounded-full
                                                bg-cyan-400/10
                                                blur-2xl
                                                transition-transform
                                                duration-500
                                                group-hover:scale-150
                                            "
                                        />

                                        <div
                                            className="
                                                relative
                                                flex
                                                h-11
                                                w-11
                                                items-center
                                                justify-center
                                                rounded-xl
                                                bg-gradient-to-br
                                                from-blue-500
                                                to-cyan-400
                                                text-white
                                                shadow-lg
                                                shadow-blue-500/20
                                            "
                                        >
                                            {item.icon}
                                        </div>

                                        <p
                                            className="
                                                relative
                                                mt-5
                                                text-3xl
                                                font-black
                                                tracking-tight
                                                text-white
                                                sm:text-4xl
                                            "
                                        >
                                            {loading
                                                ? "—"
                                                : item.value.toLocaleString()}
                                        </p>

                                        <p
                                            className="
                                                relative
                                                mt-1
                                                text-xs
                                                font-semibold
                                                text-slate-400
                                                sm:text-sm
                                            "
                                        >
                                            {item.label}
                                        </p>

                                    </motion.div>

                                )
                            )}

                        </div>

                    </div>

                </div>

            </motion.div>

        </section>

    );
}


export default Hero;