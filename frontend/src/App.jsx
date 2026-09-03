import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

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


    return (
        <>
            <Routes>

                {/* =====================================================
                    PUBLIC LANDING PAGE
                    Completely separate from the application shell
                ====================================================== */}

                <Route
                    path="/"
                    element={<LandingPage />}
                />


                {/* =====================================================
                    NOTE SHARE APPLICATION
                    Everything below uses the existing MainLayout
                ====================================================== */}

                <Route element={<MainLayout />}>

                    {/* Existing NoteShare Home / Dashboard */}
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
                    No MainLayout
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
                AI ASSISTANT
                Do not show it on the public landing page.
                Keep it everywhere inside the actual application.
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