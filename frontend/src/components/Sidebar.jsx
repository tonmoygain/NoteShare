import { Link, useLocation } from "react-router-dom";
import {
    Home,
    BookOpen,
    Upload,
    MessageSquare,
    User,
    GraduationCap,
} from "lucide-react";

function Sidebar() {
    const location = useLocation();

    const username = localStorage.getItem("username") || "Student";
    const firstLetter = username.charAt(0).toUpperCase();

    const menus = [
        {
            title: "Home",
            icon: <Home size={22} />,
            path: "/",
        },
        {
            title: "Notes",
            icon: <BookOpen size={20} />,
            path: "/notes",

        },
        {
            title: "Blogs",
            icon: <BookOpen size={22} />,
            path: "/blogs",
        },
        {
            title: "Upload",
            icon: <Upload size={22} />,
            path: "/upload",
        },
        {
            title: "Discussion",
            icon: <MessageSquare size={22} />,
            path: "/rooms",
        },
        {
            title: "Profile",
            icon: <User size={22} />,
            path: "/profile",
        },
    ];

    const notifications = [
        {
            id: 1,
            icon: "📚",
            title: "New Note",
            message: "Operating System note uploaded.",
            time: "2 min ago",
        },

        {
            id: 2,
            icon: "📝",
            title: "New Blog",
            message: "A new blog has been published.",
            time: "10 min ago",
        },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-72 bg-white/90 backdrop-blur-xl border-r border-slate-200 shadow-2xl flex flex-col justify-between">

            {/* Logo */}
            <div className="p-8">

                <div className="flex items-center gap-4">

                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg">

                        <GraduationCap className="text-white" size={30} />

                    </div>

                    <div>

                        <h1 className="text-3xl font-black tracking-tight text-slate-800">
                            NoteShare
                        </h1>

                        <p className="text-sm text-slate-500">
                            Student Portal
                        </p>

                    </div>

                </div>

            </div>

            {/* Menu */}
            <div className="flex-1 px-5">

                <p className="text-xs uppercase tracking-widest text-slate-400 px-5 mb-4">
                    Navigation
                </p>

                <div className="space-y-3">

                    {menus.map((menu) => {

                        const active = location.pathname === menu.path;

                        return (

                            <Link
                                key={menu.title}
                                to={menu.path}
                                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300

                                ${
                                    active
                                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-xl scale-[1.02]"
                                        : "text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:translate-x-1"
                                }`}
                            >

                                <div
                                    className={`w-11 h-11 rounded-xl flex justify-center items-center

                                    ${
                                        active
                                            ? "bg-white/20"
                                            : "bg-slate-100"
                                    }`}
                                >

                                    {menu.icon}

                                </div>

                                <span className="font-semibold text-[15px]">
                                    {menu.title}
                                </span>

                            </Link>

                        );

                    })}

                </div>

            </div>

        </aside>
    );
}

export default Sidebar;