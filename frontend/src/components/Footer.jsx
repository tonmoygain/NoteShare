import {
    GraduationCap,
    Mail,
    MapPin,
    Globe,
    ArrowUp,
} from "lucide-react";

function Footer() {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <footer className="mt-20 bg-slate-950 text-white">

            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-8 py-16">

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">

                    {/* Brand */}
                    <div>

                        <div className="flex items-center gap-4">

                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <GraduationCap size={26} />
                            </div>

                            <div>
                                <h2 className="text-2xl font-black">
                                    NoteShare
                                </h2>

                                <p className="text-xs text-slate-400 mt-1">
                                    University Learning Platform
                                </p>
                            </div>

                        </div>

                        <p className="text-slate-400 leading-7 mt-6 max-w-sm">
                            A modern academic platform where students can
                            share notes, read educational blogs and
                            collaborate with classmates.
                        </p>

                        {/* Social Icons */}
                        <div className="flex items-center gap-3 mt-7">

                            <a
                                href="#"
                                className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 transition-all duration-300"
                            >
                                <Globe size={20} />
                            </a>
                            
                        </div>

                    </div>


                    {/* Platform */}
                    <div>

                        <h3 className="text-lg font-bold mb-6">
                            Platform
                        </h3>

                        <div className="space-y-4">

                            <a
                                href="/"
                                className="block text-slate-400 hover:text-white transition"
                            >
                                Home
                            </a>

                            <a
                                href="/blogs"
                                className="block text-slate-400 hover:text-white transition"
                            >
                                Academic Blogs
                            </a>

                            <a
                                href="/upload"
                                className="block text-slate-400 hover:text-white transition"
                            >
                                Upload Notes
                            </a>

                            <a
                                href="/rooms"
                                className="block text-slate-400 hover:text-white transition"
                            >
                                Discussion
                            </a>

                            <a
                                href="/profile"
                                className="block text-slate-400 hover:text-white transition"
                            >
                                My Profile
                            </a>

                        </div>

                    </div>


                    {/* Resources */}
                    <div>

                        <h3 className="text-lg font-bold mb-6">
                            Resources
                        </h3>

                        <div className="space-y-4">

                            <p className="text-slate-400">
                                Study Notes
                            </p>

                            <p className="text-slate-400">
                                Academic Articles
                            </p>

                            <p className="text-slate-400">
                                Student Discussions
                            </p>

                            <p className="text-slate-400">
                                Featured Resources
                            </p>

                            <p className="text-slate-400">
                                Learning Materials
                            </p>

                        </div>

                    </div>


                    {/* Contact */}
                    <div>

                        <h3 className="text-lg font-bold mb-6">
                            Contact
                        </h3>

                        <div className="space-y-5">

                            <div className="flex items-start gap-3">

                                <Mail
                                    size={19}
                                    className="text-blue-400 mt-1 shrink-0"
                                />

                                <div>
                                    <p className="text-sm text-slate-500">
                                        Email
                                    </p>

                                    <p className="text-slate-300 mt-1">
                                        support@noteshare.com
                                    </p>
                                </div>

                            </div>


                            <div className="flex items-start gap-3">

                                <MapPin
                                    size={19}
                                    className="text-cyan-400 mt-1 shrink-0"
                                />

                                <div>
                                    <p className="text-sm text-slate-500">
                                        Location
                                    </p>

                                    <p className="text-slate-300 mt-1">
                                        University Campus
                                    </p>
                                </div>

                            </div>

                        </div>


                        {/* Back to top */}
                        <button
                            onClick={scrollToTop}
                            className="mt-8 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all duration-300"
                        >
                            <ArrowUp size={18} />
                            Back to Top
                        </button>

                    </div>

                </div>

            </div>


            {/* Bottom Bar */}
            <div className="border-t border-slate-800">

                <div className="max-w-7xl mx-auto px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">

                    <p className="text-sm text-slate-500 text-center md:text-left">
                        © {new Date().getFullYear()} NoteShare. All rights reserved.
                    </p>

                    <div className="flex items-center gap-6 text-sm text-slate-500">

                        <span className="hover:text-white transition cursor-pointer">
                            Privacy
                        </span>

                        <span className="hover:text-white transition cursor-pointer">
                            Terms
                        </span>

                        <span className="hover:text-white transition cursor-pointer">
                            Help
                        </span>

                    </div>

                </div>

            </div>

        </footer>
    );
}

export default Footer;