import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    ArrowUpRight,
    BrainCircuit,
    BookOpen,
    Check,
    ChevronRight,
    FileText,
    GraduationCap,
    LineChart,
    MessageCircle,
    Sparkles,
    Users,
    WandSparkles,
} from "lucide-react";

import API from "../services/api";

const features = [
    {
        icon: FileText,
        title: "Knowledge Library",
        text: "Discover notes and academic resources in one focused space.",
        href: "/notes",
    },
    {
        icon: WandSparkles,
        title: "AI Assistant",
        text: "Ask questions and explore your academic resources with AI.",
        href: "/dashboard",
    },
    {
        icon: BrainCircuit,
        title: "AI Tutor",
        text: "Learn actively through teaching, quizzes and challenges.",
        href: "/ai-tutor",
    },
    {
        icon: LineChart,
        title: "Learning Intelligence",
        text: "Understand your learning progress and discover what to focus on next.",
        href: "/learning-intelligence",
    },
    {
        icon: MessageCircle,
        title: "Discussion Rooms",
        text: "Exchange ideas and keep academic conversations organized.",
        href: "/rooms",
    },
    {
        icon: BookOpen,
        title: "Academic Writing",
        text: "Read, write and share useful academic ideas with others.",
        href: "/blogs",
    },
];

const aiFeatures = [
    {
        icon: WandSparkles,
        title: "AI Assistant",
        text: "Get contextual help while exploring your academic resources.",
    },
    {
        icon: BrainCircuit,
        title: "AI Tutor",
        text: "Turn study material into guided learning and active practice.",
    },
    {
        icon: LineChart,
        title: "Learning Intelligence",
        text: "See meaningful signals about learning activity and progress.",
    },
];

const steps = [
    ["01", "Discover", "Find the right resource."],
    ["02", "Understand", "Learn with intelligent guidance."],
    ["03", "Practice", "Challenge what you know."],
    ["04", "Grow", "Reflect and improve."],
];

function Reveal({ children, delay = 0, className = "" }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
                duration: 0.65,
                delay,
                ease: [0.16, 1, 0.3, 1],
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export default function LandingPage() {
    const navigate = useNavigate();
    const [profileOpen, setProfileOpen] = useState(false);
    const [profile, setProfile] = useState(null);

    const isLoggedIn = !!localStorage.getItem("access");

    useEffect(() => {
        if (!isLoggedIn){
            setProfile(null);
            return;
        }

        const loadProfile = async () => {
            try {
                const response = await API.get("profile/");
                const data = response.data?.user || response.data;
                setProfile(data);
            } catch (error) {
                console.error("Failed to load profile:", error);
            }
        };

        loadProfile();
    }, [isLoggedIn]);

    const displayName =
        profile?.first_name && profile?.last_name
            ? `${profile.first_name} ${profile.last_name}`
            : profile?.name ||
              profile?.username ||
              profile?.full_name ||
              profile?.first_name ||
              "Student";

    const profileImage =
        profile?.profile_image ||
        profile?.profile_picture ||
        profile?.avatar ||
        profile?.image ||
        profile?.photo ||
        profile?.profile?.profile_image ||
        profile?.profile?.profile_picture ||
        profile?.profile?.image ||
        null;

    const getProfileImageUrl = (image) => {
        if (!image || typeof image !== "string") {
            return null;
        }

        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {
            return image;
        }

        const baseURL = API.defaults.baseURL || window.location.origin;

        return `${baseURL.replace(/\/api\/?$/, "")}${
            image.startsWith("/") ? image : `/${image}`
        }`;
    };

    const profileImageUrl = getProfileImageUrl(profileImage);

    const handleLogout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        setProfileOpen(false);
        setProfile(null);
        navigate("/login");
    };

    return (
        <div className="landing-page min-h-screen overflow-x-hidden bg-white text-slate-900">

            {/* ================= NAVBAR ================= */}
            <header className="fixed inset-x-0 top-0 z-50">
                <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
                    <nav className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-3 shadow-[0_15px_45px_rgba(15,23,42,.07)] backdrop-blur-xl sm:px-5">

                        <Link to="/" className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 text-white shadow-lg shadow-blue-500/20">
                                <GraduationCap size={20} />
                            </div>

                            <div>
                                <p className="text-[15px] font-black tracking-tight text-slate-950">
                                    NoteShare
                                </p>
                                <p className="hidden text-[9px] font-black uppercase tracking-[.18em] text-slate-400 sm:block">
                                    Learn · Share · Grow
                                </p>
                            </div>
                        </Link>

                        <div className="hidden items-center gap-8 md:flex">
                            <a
                                href="#ai"
                                className="text-sm font-bold text-slate-500 transition hover:text-blue-600"
                            >
                                AI
                            </a>

                            <a
                                href="#features"
                                className="text-sm font-bold text-slate-500 transition hover:text-blue-600"
                            >
                                Platform
                            </a>

                            <a
                                href="#why"
                                className="text-sm font-bold text-slate-500 transition hover:text-blue-600"
                            >
                                Why NoteShare
                            </a>

                            <a
                                href="#how"
                                className="text-sm font-bold text-slate-500 transition hover:text-blue-600"
                            >
                                How it works
                            </a>
                        </div>

                        <div className="flex items-center gap-2">
                            {isLoggedIn ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setProfileOpen((prev) => !prev)}
                                        className="group flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/90 px-2.5 py-2 shadow-[0_8px_30px_rgba(15,23,42,.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_14px_35px_rgba(37,99,235,.12)]"
                                    >
                                        <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 text-xs font-black text-white shadow-md shadow-blue-500/20">
                                            {profileImageUrl ? (
                                                <img
                                                    src={profileImageUrl}
                                                    alt={displayName}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = "none";
                                                    }}

                                                />
                                            ) : (
                                                <span>
                                                    {String(displayName)
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </span>
                                            )}

                                            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
                                        </div>
                                                
                                        <div className="hidden text-left sm:block">
                                            <p className="max-w-[140px] truncate text-xs font-black text-slate-800">
                                                {displayName}
                                            </p>

                                            <p className="text-[9px] font-bold uppercase tracking-[.12em] text-slate-400">
                                                My Account
                                            </p>
                                        </div>

                                        <ChevronRight
                                            size={14}
                                            className={`mr-1 text-slate-400 transition-transform duration-300 ${
                                                profileOpen
                                                    ? "rotate-90 text-blue-500"
                                                    : ""
                                            }`}
                                        />
                                    </button>

                                    {profileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 top-full mt-3 w-64 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 p-2 shadow-[0_25px_70px_rgba(15,23,42,.16)] backdrop-blur-2xl"
                                        >
                                            <div className="mb-2 rounded-2xl bg-slate-50 p-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 text-sm font-black text-white shadow-lg shadow-blue-500/20">
                                                        {profileImageUrl ? (
                                                            <img
                                                                src={profileImageUrl}
                                                                alt={displayName}
                                                                className="h-full w-full object-cover"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display =
                                                                        "none";
                                                                }}
                                                            />
                                                        ) : (
                                                            <span>
                                                                {String(displayName)
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-black text-slate-900">
                                                            {displayName}
                                                        </p>

                                                        <p className="truncate text-[10px] font-semibold text-slate-400">
                                                            {profile?.email ||
                                                                "NoteShare member"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <Link
                                                to="/profile"
                                                onClick={() => setProfileOpen(false)}
                                                className="group flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-blue-50"
                                            >
                                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-blue-100 group-hover:text-blue-600">
                                                    <Users size={16} />
                                                </div>

                                                <div>
                                                    <p className="text-xs font-black text-slate-700">
                                                        My Profile
                                                    </p>

                                                    <p className="text-[9px] font-semibold text-slate-400">
                                                        View your profile
                                                    </p>
                                                </div>

                                                <ArrowUpRight
                                                    size={14}
                                                    className="ml-auto text-slate-300 transition group-hover:text-blue-500"
                                                />
                                            </Link>

                                            <Link
                                                to="/upload"
                                                onClick={() => setProfileOpen(false)}
                                                className="group flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-blue-50"
                                            >
                                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-blue-100 group-hover:text-blue-600">
                                                    <FileText size={16} />
                                                </div>

                                                <div>
                                                    <p className="text-xs font-black text-slate-700">
                                                        Upload Notes
                                                    </p>

                                                    <p className="text-[9px] font-semibold text-slate-400">
                                                        Share academic resources
                                                    </p>
                                                </div>

                                                <ArrowUpRight
                                                    size={14}
                                                    className="ml-auto text-slate-300 transition group-hover:text-blue-500"
                                                />
                                            </Link>

                                            <Link
                                                to="/create-blog"
                                                onClick={() => setProfileOpen(false)}
                                                className="group flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-blue-50"
                                            >
                                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-blue-100 group-hover:text-blue-600">
                                                    <BookOpen size={16} />
                                                </div>

                                                <div>
                                                    <p className="text-xs font-black text-slate-700">
                                                        Create Blog
                                                    </p>

                                                    <p className="text-[9px] font-semibold text-slate-400">
                                                        Share your academic ideas
                                                    </p>
                                                </div>

                                                <ArrowUpRight
                                                    size={14}
                                                    className="ml-auto text-slate-300 transition group-hover:text-blue-500"
                                                />
                                            </Link>

                                            <div className="my-2 border-t border-slate-100" />

                                            <button
                                                onClick={handleLogout}
                                                className="group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-red-50"
                                            >
                                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500 transition group-hover:bg-red-100">
                                                    <ArrowRight
                                                        size={16}
                                                        className="rotate-180"
                                                    />
                                                </div>

                                                <div>
                                                    <p className="text-xs font-black text-red-500">
                                                        Log out
                                                    </p>

                                                    <p className="text-[9px] font-semibold text-slate-400">
                                                        Sign out of NoteShare
                                                    </p>
                                                </div>
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="hidden rounded-xl px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-50 sm:inline-flex"
                                    >
                                        Log in
                                    </Link>

                                    <Link
                                        to="/register"
                                        className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-blue-700"
                                    >
                                        Get started
                                        <ArrowUpRight size={15} />
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            </header>

            {/* ================= HERO ================= */}
            <section className="relative overflow-hidden bg-slate-950 pt-40">

                <div className="absolute left-1/2 top-[-280px] h-[650px] w-[650px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[140px]" />

                <div className="absolute right-[-180px] top-[22%] h-[420px] w-[420px] rounded-full bg-cyan-400/10 blur-[120px]" />

                <div
                    className="absolute inset-0 opacity-[.06]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)",
                        backgroundSize: "52px 52px",
                        maskImage:
                            "linear-gradient(to bottom, black, transparent 90%)",
                    }}
                />

                <div className="relative mx-auto max-w-5xl px-4 pb-28 text-center sm:px-6 lg:pb-36">

                    <Reveal>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.05] px-4 py-2 text-[10px] font-black uppercase tracking-[.18em] text-blue-200">
                            <Sparkles size={13} />
                            A smarter academic platform
                        </span>
                    </Reveal>

                    <Reveal delay={0.05}>
                        <h1 className="mt-8 text-5xl font-black leading-[.97] tracking-[-.055em] text-white sm:text-6xl lg:text-[78px]">
                            Your learning,
                            <span className="block bg-gradient-to-r from-cyan-300 via-blue-200 to-white bg-clip-text text-transparent">
                                thoughtfully connected.
                            </span>
                        </h1>
                    </Reveal>

                    <Reveal delay={0.1}>
                        <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                            NoteShare brings academic resources, AI-powered
                            learning, progress intelligence and student
                            collaboration into one focused platform.
                        </p>
                    </Reveal>

                    <Reveal delay={0.16} className="mt-9">
                        <div className="flex flex-col justify-center gap-3 sm:flex-row">
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 text-sm font-black text-white shadow-[0_20px_55px_rgba(37,99,235,.25)] transition hover:-translate-y-1"
                            >
                                Enter NoteShare
                                <ArrowRight
                                    size={17}
                                    className="transition-transform group-hover:translate-x-1"
                                />
                            </button>

                            <a
                                href="#features"
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[.04] px-6 py-4 text-sm font-black text-white transition hover:-translate-y-1 hover:bg-white/[.08]"
                            >
                                Explore the platform
                                <ChevronRight size={16} />
                            </a>
                        </div>
                    </Reveal>

                    <Reveal delay={0.22} className="mt-8">
                        <div className="flex flex-wrap justify-center gap-x-7 gap-y-3 text-[10px] font-bold text-slate-500">
                            <span>Academic Resources</span>
                            <span>AI Learning</span>
                            <span>Learning Intelligence</span>
                            <span>Student Community</span>
                        </div>
                    </Reveal>

                </div>

                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
            </section>

            {/* ================= AI ================= */}
            <section id="ai" className="bg-white py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    <div className="grid gap-14 lg:grid-cols-[.9fr_1.1fr] lg:items-center">

                        <Reveal>
                            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-blue-600">
                                <Sparkles size={12} />
                                NoteShare Intelligence
                            </span>

                            <h2 className="mt-6 max-w-2xl text-4xl font-black leading-[1.03] tracking-[-.04em] text-slate-950 sm:text-5xl">
                                AI designed to support
                                <span className="block text-slate-400">
                                    the learning process.
                                </span>
                            </h2>

                            <p className="mt-6 max-w-xl text-base leading-8 text-slate-500 sm:text-lg">
                                NoteShare uses AI where it can genuinely help:
                                understanding resources, practising concepts
                                and turning learning activity into useful
                                insight.
                            </p>
                        </Reveal>

                        <div className="space-y-4">
                            {aiFeatures.map((item, index) => {
                                const Icon = item.icon;

                                return (
                                    <Reveal key={item.title} delay={index * 0.06}>
                                        <div className="group rounded-[26px] border border-slate-200 bg-slate-50/70 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_20px_55px_rgba(15,23,42,.07)]">
                                            <div className="flex items-start gap-4">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm ring-1 ring-slate-200">
                                                    <Icon size={20} />
                                                </div>

                                                <div>
                                                    <p className="text-sm font-black text-slate-950">
                                                        {item.title}
                                                    </p>

                                                    <p className="mt-1.5 text-xs leading-6 text-slate-500">
                                                        {item.text}
                                                    </p>
                                                </div>

                                                <ArrowUpRight
                                                    size={16}
                                                    className="ml-auto text-slate-300 transition group-hover:text-blue-600"
                                                />
                                            </div>
                                        </div>
                                    </Reveal>
                                );
                            })}
                        </div>

                    </div>
                </div>
            </section>

            {/* ================= WHY ================= */}
            <section id="why" className="bg-slate-50 py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    <Reveal className="max-w-3xl">
                        <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-blue-600 shadow-sm ring-1 ring-slate-200">
                            Why NoteShare
                        </span>

                        <h2 className="mt-6 text-4xl font-black leading-[1.04] tracking-[-.04em] text-slate-950 sm:text-5xl">
                            More than a place to
                            <span className="block text-slate-400">
                                store academic files.
                            </span>
                        </h2>

                        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-500 sm:text-lg">
                            Learning becomes easier when the resources,
                            guidance, practice and people around you feel like
                            part of the same experience.
                        </p>
                    </Reveal>

                    <div className="mt-14 grid gap-5 lg:grid-cols-3">

                        <Reveal className="lg:col-span-2">
                            <div className="h-full rounded-[32px] border border-slate-200 bg-white p-7 shadow-[0_15px_50px_rgba(15,23,42,.05)] sm:p-9">

                                <div className="flex items-start justify-between gap-6">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[.16em] text-blue-600">
                                            One connected workflow
                                        </p>

                                        <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                                            Discover. Understand. Practice.
                                            Grow.
                                        </h3>
                                    </div>

                                    <GraduationCap
                                        size={22}
                                        className="text-blue-500"
                                    />
                                </div>

                                <div className="mt-9 grid gap-3 sm:grid-cols-4">
                                    {steps.map(([number, title, text]) => (
                                        <div
                                            key={number}
                                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                        >
                                            <span className="text-[9px] font-black tracking-[.15em] text-slate-300">
                                                {number}
                                            </span>

                                            <p className="mt-6 text-sm font-black text-slate-950">
                                                {title}
                                            </p>

                                            <p className="mt-2 text-[10px] font-semibold leading-5 text-slate-500">
                                                {text}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        </Reveal>

                        <div className="grid gap-5">

                            <Reveal delay={0.05}>
                                <div className="rounded-[30px] border border-slate-200 bg-white p-7">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                        <FileText size={19} />
                                    </div>

                                    <h3 className="mt-6 text-xl font-black text-slate-950">
                                        Focused resources.
                                    </h3>

                                    <p className="mt-3 text-sm leading-7 text-slate-500">
                                        Keep useful academic material organized
                                        and easy to discover.
                                    </p>
                                </div>
                            </Reveal>

                            <Reveal delay={0.1}>
                                <div className="rounded-[30px] bg-slate-950 p-7">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[.08] text-cyan-300">
                                        <Users size={19} />
                                    </div>

                                    <h3 className="mt-6 text-xl font-black text-white">
                                        Learning together.
                                    </h3>

                                    <p className="mt-3 text-sm leading-7 text-slate-400">
                                        Share knowledge, exchange ideas and
                                        learn with other students.
                                    </p>
                                </div>
                            </Reveal>

                        </div>
                    </div>
                </div>
            </section>

            {/* ================= FEATURES ================= */}
            <section id="features" className="bg-white py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    <Reveal className="max-w-2xl">
                        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-blue-600">
                            The platform
                        </span>

                        <h2 className="mt-6 text-4xl font-black tracking-[-.04em] text-slate-950 sm:text-5xl">
                            Everything has a purpose.
                        </h2>

                        <p className="mt-5 text-base leading-8 text-slate-500 sm:text-lg">
                            Six focused experiences designed to work together.
                        </p>
                    </Reveal>

                    <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;

                            return (
                                <Reveal
                                    key={feature.title}
                                    delay={(index % 3) * 0.05}
                                >
                                    <motion.button
                                        whileHover={{ y: -5 }}
                                        onClick={() =>
                                            navigate(feature.href)
                                        }
                                        className="group w-full rounded-[28px] border border-slate-200 bg-white p-6 text-left shadow-[0_10px_35px_rgba(15,23,42,.035)] transition-shadow hover:shadow-[0_20px_55px_rgba(15,23,42,.08)]"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-blue-600 ring-1 ring-slate-200">
                                                <Icon size={20} />
                                            </div>

                                            <ArrowUpRight
                                                size={16}
                                                className="text-slate-300 transition group-hover:text-blue-600"
                                            />
                                        </div>

                                        <h3 className="mt-7 text-xl font-black tracking-tight text-slate-950">
                                            {feature.title}
                                        </h3>

                                        <p className="mt-3 text-sm leading-7 text-slate-500">
                                            {feature.text}
                                        </p>

                                        <div className="mt-6 flex items-center gap-2 text-xs font-black text-blue-600">
                                            Explore
                                            <ChevronRight
                                                size={14}
                                                className="transition-transform group-hover:translate-x-1"
                                            />
                                        </div>
                                    </motion.button>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </section>


            {/* ================= HOW IT WORKS ================= */}
            <section id="how" className="bg-slate-50 py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    <Reveal className="max-w-3xl">
                        <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-blue-600 shadow-sm ring-1 ring-slate-200">
                            How it works
                        </span>

                        <h2 className="mt-6 text-4xl font-black leading-[1.04] tracking-[-.04em] text-slate-950 sm:text-5xl">
                            A simple path from
                            <span className="block text-slate-400">
                            resource to progress.
                            </span>
                        </h2>

                        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-500 sm:text-lg">
                            NoteShare brings the essential parts of studying into one
                            connected flow, so you can find resources, learn from them,
                            practise what you know and keep moving forward.
                        </p>
                    </Reveal>

                    <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

                        {/* Step 01 */}
                        <Reveal delay={0.04}>
                            <div className="group h-full rounded-[28px] border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(15,23,42,.07)]">

                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black tracking-[.18em] text-blue-600">
                                        01
                                    </span>

                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                        <BookOpen size={19} />
                                    </div>
                                </div>

                                <h3 className="mt-7 text-xl font-black tracking-tight text-slate-950">
                                    Find what you need.
                                </h3>

                                <p className="mt-3 text-sm leading-7 text-slate-500">
                                    Explore notes, blogs and shared academic resources
                                    without searching across disconnected places.
                                </p>
                            </div>
                        </Reveal>

                        {/* Step 02 */}
                        <Reveal delay={0.08}>
                            <div className="group h-full rounded-[28px] border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(15,23,42,.07)]">

                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black tracking-[.18em] text-blue-600">
                                        02
                                    </span>

                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                        <WandSparkles size={19} />
                                    </div>
                                </div>

                                <h3 className="mt-7 text-xl font-black tracking-tight text-slate-950">
                                    Learn with guidance.
                                </h3>

                                <p className="mt-3 text-sm leading-7 text-slate-500">
                                    Use NoteShare's intelligent learning tools to understand
                                    concepts and get contextual academic support.
                                </p>
                            </div>
                        </Reveal>

                        {/* Step 03 */}
                        <Reveal delay={0.12}>
                            <div className="group h-full rounded-[28px] border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(15,23,42,.07)]">

                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black tracking-[.18em] text-blue-600">
                                        03
                                    </span>

                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                        <BrainCircuit size={19} />
                                    </div>
                                </div>

                                <h3 className="mt-7 text-xl font-black tracking-tight text-slate-950">
                                    Practice actively.
                                </h3>

                                <p className="mt-3 text-sm leading-7 text-slate-500">
                                    Turn passive reading into active learning through
                                    quizzes, challenges and guided practice.
                                </p>
                            </div>
                        </Reveal>

                        {/* Step 04 */}
                        <Reveal delay={0.16}>
                            <div className="group h-full rounded-[28px] border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(15,23,42,.07)]">

                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black tracking-[.18em] text-blue-600">
                                        04
                                    </span>

                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                        <LineChart size={19} />
                                    </div>
                                </div>

                                <h3 className="mt-7 text-xl font-black tracking-tight text-slate-950">
                                    See your progress.
                                </h3>

                                <p className="mt-3 text-sm leading-7 text-slate-500">
                                    Use learning insights to reflect on your activity and
                                    understand where to focus next.
                                </p>
                            </div>
                        </Reveal>

                    </div>
                </div>
            </section>



            {/* ================= FINAL CTA ================= */}
            <section className="relative overflow-hidden bg-slate-950 py-28 sm:py-36">
                <div className="absolute left-1/2 top-[-200px] h-[500px] w-[650px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[130px]" />

                <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
                    <Reveal>

                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 text-white shadow-xl shadow-blue-500/20">
                            <GraduationCap size={24} />
                        </div>

                        <p className="mt-6 text-[10px] font-black uppercase tracking-[.18em] text-cyan-300">
                            Welcome to NoteShare
                        </p>

                        <h2 className="mt-4 text-4xl font-black tracking-[-.04em] text-white sm:text-6xl">
                            Your learning deserves
                            <span className="block text-slate-500">
                                a better system.
                            </span>
                        </h2>

                        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
                            Bring your resources, learning tools, insight and
                            academic community into one place.
                        </p>

                        <button
                            onClick={() => navigate("/dashboard")}
                            className="mt-9 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 text-sm font-black text-white shadow-xl shadow-blue-500/20 transition hover:-translate-y-1"
                        >
                            Enter NoteShare
                            <ArrowRight size={17} />
                        </button>

                    </Reveal>
                </div>
            </section>

            {/* ================= FOOTER ================= */}
            <footer className="bg-slate-950">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    {/* Main Footer */}
                    <div className="grid gap-12 border-t border-white/10 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">

                        {/* Brand */}
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 text-white shadow-lg shadow-blue-500/20">
                                    <GraduationCap size={19} />
                                </div>

                            <div>
                                <p className="text-sm font-black text-white">
                                    NoteShare
                                </p>

                                <p className="text-[9px] font-semibold text-slate-500">
                                    Learn · Share · Grow
                                </p>
                            </div>
                        </div>

                        <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
                            A focused academic platform for learning, sharing,
                            collaboration and intelligent study.
                        </p>

                        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5 text-[9px] font-black uppercase tracking-[.14em] text-slate-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Built for better learning
                        </div>
                    </div>

                    {/* Platform */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[.18em] text-slate-600">
                            Platform
                        </p>

                        <div className="mt-5 flex flex-col gap-3">
                            <Link
                                to="/notes"
                                className="text-xs font-bold text-slate-400 transition hover:text-white"
                            >
                                Knowledge Library
                            </Link>

                            <Link
                                to="/ai-tutor"
                                className="text-xs font-bold text-slate-400 transition hover:text-white"
                            >
                                AI Tutor
                            </Link>

                            <Link
                                to="/learning-intelligence"
                                className="text-xs font-bold text-slate-400 transition hover:text-white"
                            >
                                Learning Intelligence
                            </Link>

                            <Link
                                to="/rooms"
                                className="text-xs font-bold text-slate-400 transition hover:text-white"
                            >
                                Discussion Rooms
                            </Link>
                        </div>
                    </div>

                    {/* Resources */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[.18em] text-slate-600">
                            Resources
                        </p>

                        <div className="mt-5 flex flex-col gap-3">
                            <Link
                                to="/blogs"
                                className="text-xs font-bold text-slate-400 transition hover:text-white"
                            >
                                Academic Blogs
                            </Link>

                            <Link
                                to="/notes"
                                className="text-xs font-bold text-slate-400 transition hover:text-white"
                            >
                                Browse Notes
                            </Link>

                            <a
                                href="#ai"
                                className="text-xs font-bold text-slate-400 transition hover:text-white"
                            >
                                NoteShare AI
                            </a>

                            <a
                                href="#how"
                                className="text-xs font-bold text-slate-400 transition hover:text-white"
                            >
                                How it works
                            </a>
                        </div>
                    </div>

                    {/* Account */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[.18em] text-slate-600">
                            Account
                        </p>

                        <div className="mt-5 flex flex-col gap-3">
                            <Link
                                to="/login"
                                className="text-xs font-bold text-slate-400 transition hover:text-white"
                            >
                                Log in
                            </Link>

                            <Link
                                to="/register"
                                className="text-xs font-bold text-slate-400 transition hover:text-white"
                            >
                                Create account
                            </Link>

                            <Link
                                to="/dashboard"
                                className="text-xs font-bold text-slate-400 transition hover:text-white"
                            >
                                Enter NoteShare
                            </Link>
                        </div>
                    </div>
                </div>

                    {/* Bottom Footer */}
                    <div className="flex flex-col gap-4 border-t border-white/10 py-6 text-[10px] font-semibold text-slate-600 sm:flex-row sm:items-center sm:justify-between">

                        <p>
                            © {new Date().getFullYear()} NoteShare. All rights reserved.
                        </p>

                        <div className="flex items-center gap-5">
                            <span className="transition hover:text-slate-400">
                                Learn
                            </span>

                            <span className="transition hover:text-slate-400">
                                Share
                            </span>

                            <span className="transition hover:text-slate-400">
                                Grow
                            </span>
                        </div>

                        <p className="text-slate-700">
                            A better way to learn together.
                        </p>

                    </div>
                </div>
            </footer>
        </div>
    );
}