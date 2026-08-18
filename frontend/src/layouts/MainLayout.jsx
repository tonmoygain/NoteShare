import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import { motion } from "motion/react";

import Header from "../components/Header";

function MainLayout() {

    return (
        <div className="min-h-screen bg-[#f1f4f8] text-slate-900">

            {/* =====================================================
                SIDEBAR
            ====================================================== */}

            <Sidebar />

            {/* =====================================================
                MAIN APPLICATION AREA
            ====================================================== */}

            <div
                className="
                    relative
                    min-h-screen
                    overflow-x-hidden
                    bg-[#f1f4f8]
                    transition-colors
                    duration-300
                    lg:ml-72
                "
            >

                {/* =================================================
                    SOFT AMBIENT BACKGROUND
                ================================================== */}

                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none
                        absolute
                        inset-0
                        overflow-hidden
                    "
                >
                    <motion.div
                        animate={{
                            x: [0, 18, 0],
                            y: [0, -12, 0],
                            scale: [1, 1.04, 1],
                        }}
                        transition={{
                            duration: 12,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="
                            absolute
                            -right-32
                            -top-32
                            h-96
                            w-96
                            rounded-full
                            bg-blue-300/10
                            blur-3xl
                        "
                    />

                    <motion.div
                        animate={{
                            x: [0, -15, 0],
                            y: [0, 16, 0],
                            scale: [1, 1.05, 1],
                        }}
                        transition={{
                            duration: 14,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="
                            absolute
                            left-1/3
                            top-1/4
                            h-80
                            w-80
                            rounded-full
                            bg-cyan-300/7
                            blur-3xl
                        "
                    />

                    <motion.div
                        animate={{
                            x: [0, 12, 0],
                            y: [0, -18, 0],
                            scale: [1, 1.05, 1],
                        }}
                        transition={{
                            duration: 16,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="
                            absolute
                            -bottom-32
                            right-1/4
                            h-96
                            w-96
                            rounded-full
                            bg-indigo-300/7
                            blur-3xl
                        "
                    />
                </div>

                {/* =================================================
                    CONTENT
                ================================================== */}

                <div className="relative z-10 min-h-screen">

                    <Header />

                    <main
                        className="
                            px-3
                            pb-10
                            pt-1
                            sm:px-5
                            sm:pb-12
                            lg:px-7
                            xl:px-8
                        "
                    >
                        <div>
                            <Outlet />
                        </div>
                    </main>

                </div>
            </div>
        </div>
    );
}

export default MainLayout;