import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, X } from "lucide-react";

import MainLayout from "./layouts/MainLayout";
import AIAssistant from "./components/AIAssistant";

import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import Notes from "./pages/Notes";
import Blogs from "./pages/Blogs";
import Upload from "./pages/Upload";
import Rooms from "./pages/Rooms";
import RoomDetails from "./pages/RoomDetails";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EditNote from "./pages/EditNote";
import NoteDetails from "./pages/NoteDetails";
import CreateBlog from "./pages/CreateBlog";
import EditBlog from "./pages/EditBlog";
import BlogDetails from "./pages/BlogDetails";
import SocialCallback from "./pages/SocialCallback";
import AITutor from "./pages/AITutor";
import LearningInsights from "./pages/LearningInsights";

import ProtectedRoute from "./components/ProtectedRoute";


function AppContent() {

    const location = useLocation();

    const isLandingPage =
        location.pathname === "/";

    const [successMessage, setSuccessMessage] =
        useState("");

    useEffect(() => {
        const showSuccess = () => {
            const message =
                sessionStorage.getItem("noteshare_success");

            if (!message) {
                return;
            }

            sessionStorage.removeItem("noteshare_success");
            setSuccessMessage(message);
        };

        showSuccess();

        window.addEventListener(
            "noteshare:success",
            showSuccess
        );

        return () => {
            window.removeEventListener(
                "noteshare:success",
                showSuccess
            );
        };
    }, []);


    useEffect(() => {
        if (!successMessage) {
            return;
        }

        const timer = window.setTimeout(() => {
            setSuccessMessage("");
        }, 3000);

        return () => {
            window.clearTimeout(timer);
        };
    }, [successMessage]);


    const closeSuccessToast = () => {
        setSuccessMessage("");
    };


    return (
        <>
            <Routes>

                {/* =====================================================
                    PUBLIC LANDING PAGE
                ====================================================== */}

                <Route
                    path="/"
                    element={<LandingPage />}
                />


                {/* =====================================================
                    NOTE SHARE APPLICATION
                ====================================================== */}

                <Route element={<MainLayout />}>

                    <Route
                        path="/dashboard"
                        element={<Home />}
                    />

                    <Route
                        path="/notes"
                        element={<Notes />}
                    />

                    <Route
                        path="/blogs"
                        element={<Blogs />}
                    />

                    <Route
                        path="/blog/:id"
                        element={<BlogDetails />}
                    />

                    <Route
                        path="/create-blog"
                        element={
                            <ProtectedRoute>
                                <CreateBlog />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/edit-blog/:id"
                        element={
                            <ProtectedRoute>
                                <EditBlog />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/rooms"
                        element={<Rooms />}
                    />

                    <Route
                        path="/rooms/:id"
                        element={<RoomDetails />}
                    />

                    <Route
                        path="/note/:id"
                        element={<NoteDetails />}
                    />

                    <Route
                        path="/upload"
                        element={
                            <ProtectedRoute>
                                <Upload />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/ai-tutor"
                        element={
                            <ProtectedRoute>
                                <AITutor />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/learning-intelligence"
                        element={
                            <ProtectedRoute>
                                <LearningInsights />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/edit/:id"
                        element={
                            <ProtectedRoute>
                                <EditNote />
                            </ProtectedRoute>
                        }
                    />

                </Route>


                {/* =====================================================
                    AUTHENTICATION
                ====================================================== */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/social-callback"
                    element={<SocialCallback />}
                />

            </Routes>


            {/* =========================================================
                GLOBAL SUCCESS TOAST
            ========================================================== */}

            <AnimatePresence>

                {successMessage && (

                    <motion.div
                        initial={{
                            opacity: 0,
                            y: -18,
                            scale: 0.96,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            y: -12,
                            scale: 0.97,
                        }}
                        transition={{
                            duration: 0.25,
                            ease: "easeOut",
                        }}
                        className="
                            fixed
                            left-1/2
                            top-5
                            z-[9999]
                            w-[calc(100vw-32px)]
                            max-w-md
                            -translate-x-1/2
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                gap-3
                                rounded-2xl
                                border
                                border-emerald-200
                                bg-white/95
                                px-4
                                py-3.5
                                shadow-[0_20px_50px_rgba(15,23,42,0.16)]
                                backdrop-blur-xl
                                dark:border-emerald-500/20
                                dark:bg-slate-900/95
                            "
                        >

                            <div
                                className="
                                    flex
                                    h-10
                                    w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-emerald-50
                                    text-emerald-600
                                    dark:bg-emerald-500/10
                                    dark:text-emerald-400
                                "
                            >
                                <CheckCircle2 size={20} />
                            </div>


                            <div className="min-w-0 flex-1">

                                <p
                                    className="
                                        text-xs
                                        font-black
                                        uppercase
                                        tracking-[0.12em]
                                        text-emerald-600
                                        dark:text-emerald-400
                                    "
                                >
                                    Success
                                </p>

                                <p
                                    className="
                                        mt-0.5
                                        truncate
                                        text-sm
                                        font-bold
                                        text-slate-700
                                        dark:text-slate-200
                                    "
                                >
                                    {successMessage}
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={closeSuccessToast}
                                className="
                                    flex
                                    h-8
                                    w-8
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    text-slate-400
                                    transition
                                    hover:bg-slate-100
                                    hover:text-slate-700
                                    dark:hover:bg-slate-800
                                    dark:hover:text-slate-200
                                "
                                aria-label="Close"
                            >
                                <X size={16} />
                            </button>

                        </div>

                    </motion.div>

                )}

            </AnimatePresence>


            {/* =========================================================
                AI ASSISTANT
            ========================================================== */}

            {!isLandingPage && <AIAssistant />}

        </>
    );
}


function App() {

    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );

}


export default App;