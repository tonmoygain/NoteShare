import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Navbar() {

    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);

    const isLoggedIn = !!localStorage.getItem("access");

    const username = localStorage.getItem("username");


    const handleLogout = () => {

        localStorage.clear();

        setMenuOpen(false);

        navigate("/");

        window.location.reload();

    };


    return (

        <nav className="bg-white shadow-md sticky top-0 z-50">

            <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-4">


                {/* LOGO */}

                <Link
                    to="/"
                    className="text-3xl font-bold text-blue-600"
                >
                    NoteShare
                </Link>


                {/* NAVIGATION */}

                <div className="flex items-center gap-7 text-lg">


                    {/* PUBLIC LINKS */}

                    <Link
                        to="/"
                        className="hover:text-blue-600 transition"
                    >
                        Home
                    </Link>


                    <Link
                        to="/blogs"
                        className="hover:text-blue-600 transition"
                    >
                        Blogs
                    </Link>


                    <Link
                        to="/rooms"
                        className="hover:text-blue-600 transition"
                    >
                        Discussion
                    </Link>


                    {/* LOGGED IN ONLY */}

                    {isLoggedIn && (

                        <>

                            <Link
                                to="/upload"
                                className="hover:text-blue-600 transition"
                            >
                                Upload
                            </Link>


                            {/* USER MENU */}

                            <div className="relative">

                                <button
                                    onClick={() =>
                                        setMenuOpen(!menuOpen)
                                    }
                                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition"
                                >

                                    Welcome, {username || "User"}

                                    <span className="text-sm">

                                        {menuOpen ? "▲" : "▼"}

                                    </span>

                                </button>


                                {menuOpen && (

                                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">


                                        <Link
                                            to="/profile"
                                            onClick={() =>
                                                setMenuOpen(false)
                                            }
                                            className="block px-5 py-3 hover:bg-blue-50 transition"
                                        >
                                            My Profile
                                        </Link>


                                        <Link
                                            to="/upload"
                                            onClick={() =>
                                                setMenuOpen(false)
                                            }
                                            className="block px-5 py-3 hover:bg-blue-50 transition"
                                        >
                                            Upload Notes
                                        </Link>


                                        <Link
                                            to="/create-blog"
                                            onClick={() =>
                                                setMenuOpen(false)
                                            }
                                            className="block px-5 py-3 hover:bg-blue-50 transition"
                                        >
                                            Create Blogs
                                        </Link>


                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-5 py-3 text-red-600 hover:bg-red-50 transition"
                                        >
                                            Logout
                                        </button>

                                    </div>

                                )}

                            </div>

                        </>

                    )}


                    {/* LOGGED OUT */}

                    {!isLoggedIn && (

                        <div className="flex items-center gap-3 ml-2">

                            <Link
                                to="/login"
                                className="px-5 py-2.5 rounded-xl border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition"
                            >
                                Login
                            </Link>


                            <Link
                                to="/register"
                                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-md"
                            >
                                Register
                            </Link>

                        </div>

                    )}

                </div>

            </div>

        </nav>

    );

}

export default Navbar;