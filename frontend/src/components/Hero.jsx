import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    BookOpen,
    Users,
    GraduationCap,
    ArrowRight,
    FileText,
} from "lucide-react";

import API from "../services/api";

function Hero() {

    const [stats, setStats] = useState({
        notes: 0,
        students: 0,
        departments: 0,
        blogs: 0,
    });

    useEffect(() => {

        const loadStats = async () => {

            try {

                // =========================
                // LOAD NOTES
                // =========================

                const notesResponse = await API.get("notes/");

                const notes = Array.isArray(notesResponse.data)
                    ? notesResponse.data
                    : notesResponse.data.results || [];


                // =========================
                // LOAD BLOGS
                // =========================

                const blogsResponse = await API.get("blogs/");

                const blogs = Array.isArray(blogsResponse.data)
                    ? blogsResponse.data
                    : blogsResponse.data.results || [];


                // =========================
                // FIND UNIQUE STUDENTS
                // =========================

                const students = new Set();

                notes.forEach((note) => {

                    const student =
                        note.uploader_name ||
                        note.uploader ||
                        note.author ||
                        note.user ||
                        note.uploaded_by;

                    if (student) {

                        if (typeof student === "object") {

                            students.add(
                                student.id ||
                                student.username ||
                                student.email
                            );

                        } else {

                            students.add(student);

                        }

                    }

                });


                // =========================
                // FIND UNIQUE DEPARTMENTS
                // =========================

                const departments = new Set();

                notes.forEach((note) => {

                    const department =
                        note.department_name ||
                        note.department ||
                        note.department_title;

                    if (department) {

                        if (typeof department === "object") {

                            departments.add(
                                department.id ||
                                department.name ||
                                department.title
                            );

                        } else {

                            departments.add(department);

                        }

                    }

                });


                // =========================
                // UPDATE STATISTICS
                // =========================

                setStats({
                    notes: notes.length,
                    students: students.size,
                    departments: departments.size,
                    blogs: blogs.length,
                });

            } catch (error) {

                console.error(
                    "Failed to load Hero statistics:",
                    error
                );

            }

        };

        loadStats();

    }, []);


    const statsData = [

        {
            icon: <BookOpen size={32} />,
            title: stats.notes,
            subtitle: "Study Notes",
        },

        {
            icon: <Users size={32} />,
            title: stats.students,
            subtitle: "Students",
        },

        {
            icon: <GraduationCap size={32} />,
            title: stats.departments,
            subtitle: "Departments",
        },

        {
            icon: <FileText size={32} />,
            title: stats.blogs,
            subtitle: "Blogs",
        },

    ];


    return (

        <section className="max-w-7xl mx-auto px-8 mt-8">

            <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-700 shadow-2xl">

                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl"></div>

                <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>

                <div className="relative px-12 py-16 flex flex-col lg:flex-row justify-between items-center gap-12">

                    {/* LEFT SIDE */}

                    <div className="max-w-2xl">

                        <span className="inline-block bg-white/15 backdrop-blur-md px-5 py-2 rounded-full text-sm tracking-wider font-semibold">

                            🎓 Academic Resource Platform

                        </span>


                        <h1 className="text-6xl font-black text-white leading-tight mt-6">

                            Share.

                            <span className="text-cyan-300">

                                Learn.

                            </span>

                            <br />

                            Grow Together.

                        </h1>


                        <p className="mt-7 text-lg leading-8 text-slate-200">

                            Upload study notes, discover learning materials,
                            read academic blogs and collaborate with students
                            from different departments through one modern
                            platform.

                        </p>


                        <div className="flex flex-wrap gap-5 mt-10">

                            {/* Explore Notes */}

                            <button
                                onClick={() => {

                                    document
                                        .getElementById("notes-section")
                                        ?.scrollIntoView({
                                            behavior: "smooth",
                                        });

                                }}
                                className="bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg flex items-center gap-3"
                            >

                                Explore Study Resources

                                <ArrowRight size={20} />

                            </button>

                        </div>


                        <p className="text-slate-300 mt-8">

                            📚 Share Notes • 📝 Read Blogs • 🤝 Connect Students

                        </p>

                    </div>


                    {/* RIGHT SIDE */}

                    <div className="grid grid-cols-2 gap-6">

                        {statsData.map((item) => (

                            <div
                                key={item.subtitle}
                                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-7 w-48 hover:-translate-y-2 hover:bg-white/20 transition-all duration-300"
                            >

                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-white shadow-lg">

                                    {item.icon}

                                </div>


                                <h2 className="text-4xl font-black text-white mt-6">

                                    {item.title}

                                </h2>


                                <p className="text-slate-200 mt-2">

                                    {item.subtitle}

                                </p>

                            </div>

                        ))}

                    </div>

                </div>

            </div>

        </section>

    );

}

export default Hero;