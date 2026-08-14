import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

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

import ProtectedRoute from "./components/ProtectedRoute";

function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route element={<MainLayout />}>

                    <Route path="/" element={<Home />} />

                    <Route path="/notes" element={<Notes />} />

                    <Route path="/blogs" element={<Blogs />} />

                    <Route path="/blog/:id" element={<BlogDetails />} />

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

                    <Route path="/rooms" element={<Rooms />} />

                    <Route path="/rooms/:id" element={<RoomDetails />} />

                    <Route path="/note/:id" element={<NoteDetails />} />

                    <Route
                        path="/upload"
                        element={
                            <ProtectedRoute>
                                <Upload />
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

        </BrowserRouter>

    );

}

export default App;