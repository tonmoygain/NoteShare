import { useEffect, useState } from "react";
import { BookOpen, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

import Hero from "../components/Hero";
import DashboardCards from "../components/DashboardCards";
import QuickActions from "../components/QuickActions";
import Footer from "../components/Footer";

function Home() {

    const navigate = useNavigate();

    const [blogs, setBlogs] = useState([]);
    const [stats, setStats] = useState({
        total_notes: 0,
        total_views: 0,
        total_downloads: 0,
        featured_notes: 0
    });

    const [loading, setLoading] = useState(true);
    const [blogLoading, setBlogLoading] = useState(true);

    useEffect(() => {

        // Dashboard API
        API.get("dashboard/")
            .then((res) => {

                console.log("Dashboard Response:", res.data);

                setStats(res.data);

            })
            .catch((err) => {

                console.log("Dashboard API Error:", err);

            })
            .finally(() => {

                setLoading(false);

            });


        // Blogs API
        API.get("blogs/")
            .then((res) => {

                console.log("Blogs Response:", res.data);

                setBlogs(res.data || []);

            })
            .catch((err) => {

                console.log("Blogs API Error:", err);

                setBlogs([]);

            })
            .finally(() => {

                setBlogLoading(false);

            });

    }, []);


    // Loading screen

    if (loading) {

        return (

            <div className="min-h-screen flex items-center justify-center">

                <div className="text-center">

                    <div className="text-4xl mb-4">
                        ⏳
                    </div>

                    <p className="text-slate-500 font-semibold">
                        Loading NoteShare...
                    </p>

                </div>

            </div>

        );

    }


    return (

        <>

            {/* Hero */}

            <Hero />


            {/* Why Choose NoteShare */}

            <section className="max-w-7xl mx-auto px-8 mt-12">

                <div className="text-center mb-12">

                    <h2 className="text-4xl font-bold text-slate-800">
                        Why Choose NoteShare?
                    </h2>

                    <p className="text-gray-500 mt-4 text-lg">
                        Everything students need in one platform.
                    </p>

                </div>


                <div className="grid md:grid-cols-3 gap-8">


                    {/* Smart Notes */}

                    <div className="group relative bg-white rounded-[28px] border border-slate-100 p-8 shadow-[0_10px_40px_rgba(15,23,42,0.06)] hover:-translate-y-2 transition-all duration-500 overflow-hidden">

                        <div className="relative">

                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-3xl shadow-lg">

                                📚

                            </div>

                            <h3 className="text-2xl font-extrabold text-slate-800 mt-7">
                                Smart Notes
                            </h3>

                            <p className="text-gray-500 mt-4 leading-7">
                                Access organized lecture notes from different departments anytime.
                            </p>

                        </div>

                    </div>


                    {/* Academic Blogs */}

                    <div className="group relative bg-white rounded-[28px] border border-slate-100 p-8 shadow-[0_10px_40px_rgba(15,23,42,0.06)] hover:-translate-y-2 transition-all duration-500 overflow-hidden">

                        <div className="relative">

                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-3xl shadow-lg">

                                📝

                            </div>

                            <h3 className="text-2xl font-extrabold text-slate-800 mt-7">
                                Academic Blogs
                            </h3>

                            <p className="text-gray-500 mt-4 leading-7">
                                Read tutorials, study tips and academic articles shared by students.
                            </p>

                        </div>

                    </div>


                    {/* Easy Collaboration */}

                    <div className="group relative bg-white rounded-[28px] border border-slate-100 p-8 shadow-[0_10px_40px_rgba(15,23,42,0.06)] hover:-translate-y-2 transition-all duration-500 overflow-hidden">

                        <div className="relative">

                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl shadow-lg">

                                🚀

                            </div>

                            <h3 className="text-2xl font-extrabold text-slate-800 mt-7">
                                Easy Collaboration
                            </h3>

                            <p className="text-gray-500 mt-4 leading-7">
                                Upload, download and share resources with classmates effortlessly.
                            </p>

                        </div>

                    </div>

                </div>

            </section>


            {/* Dashboard Cards */}

            <DashboardCards stats={stats} />


            {/* Quick Actions */}

            <section className="mx-8 mt-8">

                <QuickActions />

            </section>

            <Footer />

        </>

    );

}

export default Home;