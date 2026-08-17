import { motion } from "motion/react";

import {
    GraduationCap,
    Mail,
    MapPin,
    Globe,
    ArrowUp,
    ArrowRight,
    Sparkles,
} from "lucide-react";

import { Link } from "react-router-dom";

function Footer() {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <footer className="relative mt-20 overflow-hidden bg-slate-950 text-white">

            {/* =====================================================
                AMBIENT GLOW
            ====================================================== */}

            <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-cyan-500/10 blur-3xl" />

            {/* =====================================================
                MAIN FOOTER
            ====================================================== */}

            <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16 lg:py-20">

                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1fr] lg:gap-10">

                    {/* =================================================
                        BRAND
                    ================================================== */}

                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 16,
                        }}
                        whileInView={{
                            opacity: 1,
                            y: 0,
                        }}
                        viewport={{
                            once: true,
                            amount: 0.2,
                        }}
                        transition={{
                            duration: 0.45,
                        }}
                    >
                        <div className="flex items-center gap-4">

                            <motion.div
                                whileHover={{
                                    rotate: -3,
                                    scale: 1.04,
                                }}
                                className="
                                    flex
                                    h-12
                                    w-12
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-gradient-to-br
                                    from-blue-600
                                    to-cyan-500
                                    shadow-lg
                                    shadow-blue-500/20
                                "
                            >
                                <GraduationCap
                                    size={26}
                                    strokeWidth={2.2}
                                />
                            </motion.div>

                            <div>
                                <h2 className="text-2xl font-black tracking-tight">
                                    NoteShare
                                </h2>

                                <div className="mt-1 flex items-center gap-1.5">
                                    <Sparkles
                                        size={11}
                                        className="text-cyan-400"
                                    />

                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                                        University Learning Platform
                                    </p>
                                </div>
                            </div>

                        </div>

                        <p className="mt-6 max-w-sm text-sm leading-7 text-slate-400 sm:text-base">
                            A modern academic platform where students can
                            share notes, publish educational blogs and
                            collaborate with classmates.
                        </p>

                        {/* Social */}

                        <div className="mt-7 flex items-center gap-3">
                            <motion.a
                                whileHover={{
                                    y: -2,
                                }}
                                whileTap={{
                                    scale: 0.95,
                                }}
                                href="#"
                                className="
                                    flex
                                    h-11
                                    w-11
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-slate-800
                                    bg-slate-900/80
                                    text-slate-400
                                    transition
                                    hover:border-blue-500
                                    hover:bg-blue-600
                                    hover:text-white
                                "
                                aria-label="Website"
                            >
                                <Globe size={19} />
                            </motion.a>
                        </div>

                    </motion.div>

                    {/* =================================================
                        PLATFORM
                    ================================================== */}

                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 16,
                        }}
                        whileInView={{
                            opacity: 1,
                            y: 0,
                        }}
                        viewport={{
                            once: true,
                            amount: 0.2,
                        }}
                        transition={{
                            duration: 0.45,
                            delay: 0.05,
                        }}
                    >
                        <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white">
                            Platform
                        </h3>

                        <div className="mt-6 space-y-3">
                            {[
                                {
                                    label: "Home",
                                    path: "/",
                                },
                                {
                                    label: "Academic Blogs",
                                    path: "/blogs",
                                },
                                {
                                    label: "Upload Notes",
                                    path: "/upload",
                                },
                                {
                                    label: "Discussion",
                                    path: "/rooms",
                                },
                                {
                                    label: "My Profile",
                                    path: "/profile",
                                },
                            ].map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="
                                        group
                                        flex
                                        items-center
                                        gap-2
                                        text-sm
                                        font-medium
                                        text-slate-400
                                        transition
                                        hover:text-white
                                    "
                                >
                                    <span className="h-px w-0 bg-cyan-400 transition-all duration-300 group-hover:w-3" />

                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </motion.div>

                    {/* =================================================
                        RESOURCES
                    ================================================== */}

                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 16,
                        }}
                        whileInView={{
                            opacity: 1,
                            y: 0,
                        }}
                        viewport={{
                            once: true,
                            amount: 0.2,
                        }}
                        transition={{
                            duration: 0.45,
                            delay: 0.1,
                        }}
                    >
                        <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white">
                            Resources
                        </h3>

                        <div className="mt-6 space-y-3">
                            {[
                                "Study Notes",
                                "Academic Articles",
                                "Student Discussions",
                                "Featured Resources",
                                "Learning Materials",
                            ].map((item) => (
                                <div
                                    key={item}
                                    className="group flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-slate-200"
                                >
                                    <span className="h-1 w-1 rounded-full bg-slate-700 transition group-hover:bg-cyan-400" />

                                    {item}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* =================================================
                        CONTACT
                    ================================================== */}

                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 16,
                        }}
                        whileInView={{
                            opacity: 1,
                            y: 0,
                        }}
                        viewport={{
                            once: true,
                            amount: 0.2,
                        }}
                        transition={{
                            duration: 0.45,
                            delay: 0.15,
                        }}
                    >
                        <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white">
                            Contact
                        </h3>

                        <div className="mt-6 space-y-5">

                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                                    <Mail size={18} />
                                </div>

                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                                        Email
                                    </p>

                                    <p className="mt-1 break-all text-sm font-medium text-slate-300">
                                        support@noteshare.com
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                                    <MapPin size={18} />
                                </div>

                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                                        Location
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-slate-300">
                                        University Campus
                                    </p>
                                </div>
                            </div>

                        </div>

                        <motion.button
                            whileHover={{
                                y: -2,
                            }}
                            whileTap={{
                                scale: 0.98,
                            }}
                            onClick={scrollToTop}
                            className="
                                mt-7
                                inline-flex
                                items-center
                                gap-2
                                rounded-xl
                                border
                                border-slate-800
                                bg-slate-900/80
                                px-5
                                py-3
                                text-sm
                                font-bold
                                text-slate-300
                                transition
                                hover:border-blue-500
                                hover:bg-blue-600
                                hover:text-white
                            "
                        >
                            <ArrowUp size={17} />
                            Back to Top
                        </motion.button>

                    </motion.div>

                </div>
            </div>

            {/* =====================================================
                BOTTOM BAR
            ====================================================== */}

            <div className="relative border-t border-slate-800/80">

                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-6 sm:px-8 md:flex-row">

                    <p className="text-center text-xs text-slate-500 sm:text-sm md:text-left">
                        © {new Date().getFullYear()} NoteShare. All rights reserved.
                    </p>

                    <div className="flex items-center gap-5 text-xs font-semibold text-slate-500 sm:gap-6 sm:text-sm">
                        <span className="cursor-pointer transition hover:text-white">
                            Privacy
                        </span>

                        <span className="cursor-pointer transition hover:text-white">
                            Terms
                        </span>

                        <span className="cursor-pointer transition hover:text-white">
                            Help
                        </span>

                        <ArrowRight
                            size={14}
                            className="text-slate-700"
                        />
                    </div>

                </div>

            </div>

        </footer>
    );
}

export default Footer;