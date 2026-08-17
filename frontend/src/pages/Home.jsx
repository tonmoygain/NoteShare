import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
    Sparkles,
} from "lucide-react";

import API from "../services/api";

import Hero from "../components/Hero";
import DashboardCards from "../components/DashboardCards";
import QuickActions from "../components/QuickActions";
import Footer from "../components/Footer";


function Home() {

    const [stats, setStats] = useState({
        total_notes: 0,
        total_views: 0,
        total_downloads: 0,
        featured_notes: 0,
    });


    // =========================================================
    // LOAD DASHBOARD DATA
    // =========================================================

    useEffect(() => {

        let mounted = true;

        const loadDashboard = async () => {

            try {

                const response =
                    await API.get("dashboard/");

                if (!mounted) {
                    return;
                }

                const data =
                    response?.data || {};

                setStats({
                    total_notes:
                        Number(
                            data.total_notes
                        ) || 0,

                    total_views:
                        Number(
                            data.total_views
                        ) || 0,

                    total_downloads:
                        Number(
                            data.total_downloads
                        ) || 0,

                    featured_notes:
                        Number(
                            data.featured_notes
                        ) || 0,
                });

            } catch (error) {

                console.error(
                    "Dashboard loading error:",
                    error
                );

            }
        };

        loadDashboard();

        return () => {
            mounted = false;
        };

    }, []);


    return (

        <div
            className="
                relative
                overflow-hidden
                pb-10
            "
        >

            {/* =====================================================
                HERO
            ====================================================== */}

            <Hero />


            {/* =====================================================
                DASHBOARD STATS
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
                    duration: 0.55,
                }}
                className="
                    mx-auto
                    mt-8
                    max-w-7xl
                    px-5
                    sm:px-8
                "
            >

                <DashboardCards
                    stats={stats}
                />

            </motion.section>


            {/* =====================================================
                QUICK ACTIONS
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
                    amount: 0.12,
                }}
                transition={{
                    duration: 0.6,
                }}
                className="
                    mx-auto
                    mt-12
                    max-w-7xl
                    px-5
                    sm:px-8
                "
            >

                <QuickActions />

            </motion.section>


            {/* =====================================================
                WHY CHOOSE NOTESHARE
            ====================================================== */}

            <section
                className="
                    relative
                    mx-auto
                    mt-20
                    max-w-7xl
                    px-5
                    sm:px-8
                "
            >

                {/* Decorative glow */}

                <div
                    className="
                        pointer-events-none
                        absolute
                        left-1/2
                        top-20
                        h-72
                        w-72
                        -translate-x-1/2
                        rounded-full
                        bg-blue-500/8
                        blur-3xl
                    "
                />


                {/* Heading */}

                <div
                    className="
                        relative
                        mx-auto
                        max-w-3xl
                        text-center
                    "
                >

                    <div
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-blue-100
                            bg-blue-50
                            px-4
                            py-2
                            text-[11px]
                            font-extrabold
                            uppercase
                            tracking-[0.18em]
                            text-blue-600
                        "
                    >

                        <Sparkles
                            size={14}
                        />

                        Built for students

                    </div>


                    <h2
                        className="
                            mt-5
                            text-3xl
                            font-black
                            tracking-tight
                            text-slate-900
                            sm:text-4xl
                            lg:text-5xl
                        "
                    >

                        Everything you need to

                        <span
                            className="
                                ml-2
                                bg-gradient-to-r
                                from-blue-600
                                via-cyan-500
                                to-blue-500
                                bg-clip-text
                                text-transparent
                            "
                        >
                            learn smarter.
                        </span>

                    </h2>


                    <p
                        className="
                            mx-auto
                            mt-5
                            max-w-2xl
                            text-base
                            leading-7
                            text-slate-500
                            sm:text-lg
                        "
                    >
                        One focused platform for discovering
                        resources, sharing knowledge, and
                        learning together.
                    </p>

                </div>


                {/* Feature Cards */}

                <div
                    className="
                        relative
                        mt-12
                        grid
                        gap-5
                        md:grid-cols-3
                    "
                >

                    {[
                        {
                            number: "01",
                            icon: "📚",
                            title: "Smart Notes",
                            description:
                                "Find organized lecture notes, study materials, and resources without digging through scattered chats and files.",
                        },

                        {
                            number: "02",
                            icon: "✍️",
                            title: "Academic Blogs",
                            description:
                                "Share tutorials, study tips, project experiences, and useful academic ideas with the student community.",
                        },

                        {
                            number: "03",
                            icon: "🤝",
                            title: "Easy Collaboration",
                            description:
                                "Upload, download, discuss, and exchange useful resources with classmates from one central place.",
                        },

                    ].map(
                        (feature, index) => (

                            <motion.div
                                key={
                                    feature.title
                                }
                                initial={{
                                    opacity: 0,
                                    y: 25,
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
                                    duration: 0.5,
                                    delay:
                                        index * 0.08,
                                }}
                                whileHover={{
                                    y: -7,
                                }}
                                className="
                                    group
                                    relative
                                    overflow-hidden
                                    rounded-[28px]
                                    border
                                    border-slate-200/80
                                    bg-white
                                    p-7
                                    shadow-[0_10px_35px_rgba(15,23,42,0.05)]
                                    transition-all
                                    duration-500
                                    hover:shadow-[0_25px_55px_rgba(15,23,42,0.10)]
                                "
                            >

                                {/* Glow */}

                                <div
                                    className="
                                        absolute
                                        -right-14
                                        -top-14
                                        h-40
                                        w-40
                                        rounded-full
                                        bg-blue-500/8
                                        blur-2xl
                                        transition-transform
                                        duration-700
                                        group-hover:scale-150
                                    "
                                />


                                <div
                                    className="
                                        relative
                                        flex
                                        items-center
                                        justify-between
                                    "
                                >

                                    <span
                                        className="
                                            text-[11px]
                                            font-black
                                            uppercase
                                            tracking-[0.18em]
                                            text-blue-500
                                        "
                                    >
                                        {
                                            feature.number
                                        }
                                    </span>


                                    <span
                                        className="
                                            flex
                                            h-12
                                            w-12
                                            items-center
                                            justify-center
                                            rounded-2xl
                                            bg-slate-50
                                            text-xl
                                            shadow-sm
                                        "
                                    >
                                        {
                                            feature.icon
                                        }
                                    </span>

                                </div>


                                <h3
                                    className="
                                        relative
                                        mt-8
                                        text-xl
                                        font-extrabold
                                        tracking-tight
                                        text-slate-900
                                    "
                                >
                                    {
                                        feature.title
                                    }
                                </h3>


                                <p
                                    className="
                                        relative
                                        mt-3
                                        text-sm
                                        leading-7
                                        text-slate-500
                                    "
                                >
                                    {
                                        feature.description
                                    }
                                </p>


                                <div
                                    className="
                                        relative
                                        mt-6
                                        h-1
                                        w-10
                                        rounded-full
                                        bg-gradient-to-r
                                        from-blue-600
                                        to-cyan-400
                                        transition-all
                                        duration-500
                                        group-hover:w-20
                                    "
                                />

                            </motion.div>

                        )
                    )}

                </div>

            </section>


            {/* =====================================================
                FOOTER
            ====================================================== */}

            <div
                className="
                    mt-20
                "
            >

                <Footer />

            </div>

        </div>

    );

}


export default Home;