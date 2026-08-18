import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import API from "../services/api";

import {
    User,
    Mail,
    BookOpen,
    Eye,
    Download,
    Pencil,
    Trash2,
    ExternalLink,
    Loader2,
    MapPin,
    Globe,
    Lock,
    X,
    Camera,
    Save,
    ShieldCheck,
    FileText,
    MessageSquare,
    PenLine,
    Sparkles,
    CalendarDays,
    ArrowUpRight,
} from "lucide-react";

function Profile() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] =
        useState(false);

    const [savingProfile, setSavingProfile] = useState(false);
    const [changingPassword, setChangingPassword] =
        useState(false);

    const [editForm, setEditForm] = useState({
        username: "",
        email: "",
        bio: "",
        department: "",
        location: "",
        website: "",
        linkedin: "",
        github: "",
        facebook: "",
        photo: null,
        remove_photo: false,
    });

    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });

    const getImageUrl = (photo) => {
        if (!photo) return "";

        if (photo.startsWith("http")) {
            return photo;
        }

        return `${API.defaults.baseURL.replace(/\/api\/?$/, "")}${photo}`;
    };

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("access");

            if (!token) {
                navigate("/login");
                return;
            }

            const res = await API.get("profile/");

            setProfile(res.data);

            setEditForm({
                username: res.data.username || "",
                email: res.data.email || "",
                bio: res.data.bio || "",
                department: res.data.department || "",
                location: res.data.location || "",
                website: res.data.website || "",
                linkedin: res.data.linkedin || "",
                github: res.data.github || "",
                facebook: res.data.facebook || "",
                photo: null,
                remove_photo: false,
            });
        } catch (err) {
            console.error("Profile API Error:", err);

            if (err.response?.status === 401) {
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                localStorage.removeItem("username");

                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.detail ||
                    err.response?.data?.error ||
                    "Failed to load profile."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, [navigate]);

    const handleDelete = async (id) => {
        const ok = window.confirm(
            "Are you sure you want to delete this note?"
        );

        if (!ok) return;

        try {
            await API.delete(`notes/delete/${id}/`);

            setProfile((prev) => {
                if (!prev) return prev;

                const updatedNotes = (
                    prev.user_notes || []
                ).filter((note) => note.id !== id);

                return {
                    ...prev,
                    user_notes: updatedNotes,
                    total_notes: Math.max(
                        (prev.total_notes || 1) - 1,
                        0
                    ),
                };
            });
        } catch (err) {
            console.error("Delete Note Error:", err);

            alert(
                err.response?.data?.error ||
                    "Delete failed."
            );
        }
    };

    const handleDeleteAccount = async () => {
        const firstConfirm = window.confirm(
            "This will permanently delete your account, uploaded notes and blogs. Continue?"
        );

        if (!firstConfirm) return;

        const secondConfirm = window.confirm(
            "This action cannot be undone. Are you absolutely sure?"
        );

        if (!secondConfirm) return;

        try {
            await API.delete("profile/delete-account/");

            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            localStorage.removeItem("username");

            alert(
                "Your account has been deleted successfully."
            );

            navigate("/");
            window.location.reload();
        } catch (err) {
            console.error("Delete Account Error:", err);

            if (err.response?.status === 401) {
                alert(
                    "Your session has expired. Please login again."
                );

                localStorage.clear();

                navigate("/login");
                return;
            }

            alert(
                err.response?.data?.error ||
                    err.response?.data?.detail ||
                    "Failed to delete your account."
            );
        }
    };

    const handleEditChange = (e) => {
        const {
            name,
            value,
            files,
        } = e.target;

        setEditForm((prev) => ({
            ...prev,
            [name]:
                name === "photo"
                    ? files?.[0] || null
                    : value,
        }));
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();

        if (savingProfile) return;

        try {
            setSavingProfile(true);

            const formData = new FormData();

            formData.append(
                "username",
                editForm.username.trim()
            );

            formData.append(
                "email",
                editForm.email.trim()
            );

            formData.append("bio", editForm.bio);
            formData.append(
                "department",
                editForm.department
            );
            formData.append(
                "location",
                editForm.location
            );
            formData.append(
                "website",
                editForm.website
            );
            formData.append(
                "linkedin",
                editForm.linkedin
            );
            formData.append(
                "github",
                editForm.github
            );
            formData.append(
                "facebook",
                editForm.facebook
            );
            formData.append(
                "remove_photo",
                editForm.remove_photo
                    ? "true"
                    : "false"
            );

            if (editForm.photo) {
                formData.append(
                    "photo",
                    editForm.photo
                );
            }

            const response = await API.put(
                "profile/update/",
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                }
            );

            const updatedUsername =
                response.data.username ||
                editForm.username.trim();

            localStorage.setItem(
                "username",
                updatedUsername
            );

            alert(
                "Profile updated successfully."
            );

            setShowEditModal(false);

            await loadProfile();

            window.location.reload();
        } catch (err) {
            console.error(
                "Update Profile Error:",
                err
            );

            alert(
                err.response?.data?.error ||
                    err.response?.data?.detail ||
                    "Failed to update profile."
            );
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (changingPassword) return;

        if (
            passwordForm.new_password.length < 6
        ) {
            alert(
                "New password must be at least 6 characters."
            );

            return;
        }

        if (
            passwordForm.new_password !==
            passwordForm.confirm_password
        ) {
            alert(
                "New passwords do not match."
            );

            return;
        }

        try {
            setChangingPassword(true);

            await API.post(
                "profile/change-password/",
                passwordForm
            );

            alert(
                "Password changed successfully. Please login again."
            );

            setPasswordForm({
                current_password: "",
                new_password: "",
                confirm_password: "",
            });

            setShowPasswordModal(false);

            localStorage.removeItem("access");
            localStorage.removeItem("refresh");

            navigate("/login");
        } catch (err) {
            console.error(
                "Change Password Error:",
                err
            );

            alert(
                err.response?.data?.error ||
                    err.response?.data?.detail ||
                    "Failed to change password."
            );
        } finally {
            setChangingPassword(false);
        }
    };


    if (error) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-6">
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 15,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    className="profile-error-card w-full max-w-lg rounded-[30px] border border-slate-200 bg-white p-10 text-center shadow-xl"
                >
                    <div className="profile-error-icon mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                        <ShieldCheck size={28} />
                    </div>

                    <h2 className="mt-5 text-3xl font-black text-slate-800">
                        Profile Error
                    </h2>

                    <p className="mt-4 text-slate-500">
                        {error}
                    </p>

                    <button
                        onClick={() =>
                            window.location.reload()
                        }
                        className="mt-7 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20"
                    >
                        Try Again
                    </button>
                </motion.div>
            </div>
        );
    }

    if (!profile) {
        return null;
    }

    const notes = profile.user_notes || [];
    const blogs = profile.user_blogs || [];

    const firstLetter = (
        profile.username || "U"
    )
        .charAt(0)
        .toUpperCase();

    const stats = [
        {
            label: "Uploaded Notes",
            value: profile.total_notes || 0,
            icon: BookOpen,
            iconClass:
                "bg-blue-50 text-blue-600",
            glow:
                "from-blue-500/10 to-transparent",
        },
        {
            label: "Note Views",
            value: profile.total_views || 0,
            icon: Eye,
            iconClass:
                "bg-violet-50 text-violet-600",
            glow:
                "from-violet-500/10 to-transparent",
        },
        {
            label: "Downloads",
            value: profile.total_downloads || 0,
            icon: Download,
            iconClass:
                "bg-emerald-50 text-emerald-600",
            glow:
                "from-emerald-500/10 to-transparent",
        },
        {
            label: "Blogs",
            value: blogs.length,
            icon: PenLine,
            iconClass:
                "bg-orange-50 text-orange-600",
            glow:
                "from-orange-500/10 to-transparent",
        },
    ];

    return (
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">

            {/* =====================================================
                PROFILE HERO
            ====================================================== */}

            <div
            
                className="profile-hero relative overflow-hidden rounded-[36px] border border-slate-200/70 bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-800 text-white shadow-[0_25px_70px_rgba(15,23,42,0.16)]"
            >
                <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-40 -left-24 h-[420px] w-[420px] rounded-full bg-blue-500/15 blur-3xl" />

                <div className="pointer-events-none absolute right-1/3 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full bg-indigo-400/10 blur-3xl" />

                <div className="relative p-7 sm:p-9 lg:p-10">

                    <div className="flex flex-col gap-8 lg:flex-row lg:items-center">

                        {/* Avatar */}

                        <div className="relative shrink-0 self-start">
                            <motion.div
                                whileHover={{
                                    scale: 1.03,
                                }}
                                className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white/20 bg-white/10 shadow-2xl backdrop-blur-sm sm:h-36 sm:w-36"
                            >
                                {profile.photo ? (
                                    <img
                                        src={getImageUrl(
                                            profile.photo
                                        )}
                                        alt={profile.username}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="text-5xl font-black">
                                        {firstLetter}
                                    </span>
                                )}
                            </motion.div>

                            <button
                                onClick={() =>
                                    setShowEditModal(true)
                                }
                                className="absolute bottom-1 right-1 flex h-11 w-11 items-center justify-center rounded-full border-4 border-slate-900/20 bg-white text-blue-700 shadow-lg transition hover:scale-105 hover:bg-blue-50"
                                title="Edit profile"
                            >
                                <Camera size={18} />
                            </button>
                        </div>

                        {/* Identity */}

                        <div className="min-w-0 flex-1">

                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur-sm">
                                    <ShieldCheck size={14} />
                                    Student Profile
                                </span>

                                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/10 bg-emerald-400/10 px-4 py-2 text-xs font-bold text-emerald-200">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                                    Active
                                </span>
                            </div>

                            <h1 className="mt-5 break-words text-4xl font-black tracking-tight sm:text-5xl">
                                {profile.username}
                            </h1>

                            {profile.bio ? (
                                <p className="mt-4 max-w-3xl text-base leading-7 text-blue-100 sm:text-lg">
                                    {profile.bio}
                                </p>
                            ) : (
                                <p className="mt-4 text-blue-200/70">
                                    Add a short bio to tell other students about yourself.
                                </p>
                            )}

                            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-blue-100">
                                {profile.email && (
                                    <span className="inline-flex items-start gap-2 break-all">
                                        <Mail
                                            size={16}
                                            className="mt-0.5 shrink-0"
                                        />
                                        {profile.email}
                                    </span>
                                )}

                                {profile.department && (
                                    <span className="inline-flex items-center gap-2">
                                        <BookOpen size={16} />
                                        {profile.department}
                                    </span>
                                )}

                                {profile.location && (
                                    <span className="inline-flex items-center gap-2">
                                        <MapPin size={16} />
                                        {profile.location}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}

                        <div className="flex w-full shrink-0 flex-col gap-3 sm:flex-row lg:w-auto lg:flex-col">
                            <motion.button
                                whileHover={{
                                    y: -2,
                                }}
                                whileTap={{
                                    scale: 0.98,
                                }}
                                onClick={() =>
                                    setShowEditModal(true)
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-black text-blue-700 shadow-lg transition hover:bg-blue-50"
                            >
                                <Pencil size={18} />
                                Edit Profile
                            </motion.button>

                            {profile.has_usable_password ? (
                                <motion.button
                                    whileHover={{
                                        y: -2,
                                    }}
                                    whileTap={{
                                        scale: 0.98,
                                    }}
                                    onClick={() =>
                                        setShowPasswordModal(
                                            true
                                        )
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-bold text-white backdrop-blur-sm transition hover:bg-white/15"
                                >
                                    <Lock size={18} />
                                    Change Password
                                </motion.button>
                            ) : (
                                <div className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-bold text-blue-100 backdrop-blur-sm">
                                    <ShieldCheck size={18} />
                                    Signed in with Google
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Social links */}

                    {(profile.website ||
                        profile.linkedin ||
                        profile.github ||
                        profile.facebook) && (
                        <div className="mt-8 flex flex-wrap gap-2.5 border-t border-white/10 pt-6">
                            {profile.website && (
                                <a
                                    href={profile.website}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-bold transition hover:-translate-y-0.5 hover:bg-white/15"
                                >
                                    <Globe size={16} />
                                    Website
                                    <ExternalLink size={13} />
                                </a>
                            )}

                            {profile.linkedin && (
                                <a
                                    href={profile.linkedin}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-bold transition hover:-translate-y-0.5 hover:bg-white/15"
                                >
                                    <span className="text-sm font-black">
                                        LI
                                    </span>
                                    LinkedIn
                                    <ExternalLink size={13} />
                                </a>
                            )}

                            {profile.github && (
                                <a
                                    href={profile.github}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-bold transition hover:-translate-y-0.5 hover:bg-white/15"
                                >
                                    <span className="text-sm font-black">
                                        GH
                                    </span>
                                    Github
                                    <ExternalLink size={13} />
                                </a>
                            )}

                            {profile.facebook && (
                                <a
                                    href={profile.facebook}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-bold transition hover:-translate-y-0.5 hover:bg-white/15"
                                >
                                    <span className="text-sm font-black">
                                        f
                                    </span>
                                    Facebook
                                    <ExternalLink size={13} />
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* =====================================================
                STATS
            ====================================================== */}

            <div
                
                className="profile-stats mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
            >
                {stats.map((stat, index) => {
                    const Icon = stat.icon;

                    return (
                        <motion.div
                            key={stat.label}
                            whileHover={{
                                y: -4,
                            }}
                            className="profile-stat-card group relative overflow-hidden rounded-[26px] border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.045)] transition-shadow duration-300 hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]"
                        >
                            <div
                                className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${stat.glow} blur-2xl`}
                            />

                            <div className="relative">
                                <div
                                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.iconClass}`}
                                >
                                    <Icon size={21} />
                                </div>

                                <p className="mt-5 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                                    {stat.label}
                                </p>

                                <p className="mt-1 text-4xl font-black tracking-tight text-slate-800">
                                    {stat.value}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* =====================================================
                ABOUT + ACCOUNT
            ====================================================== */}

            <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_340px]">

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 18,
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
                    }}
                    className="profile-about-card rounded-[30px] border border-slate-200/80 bg-white p-7 shadow-[0_10px_30px_rgba(15,23,42,0.045)]"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <Sparkles
                                    size={17}
                                    className="text-blue-600"
                                />

                                <h2 className="text-2xl font-black text-slate-800">
                                    About
                                </h2>
                            </div>

                            <p className="mt-1 text-sm text-slate-400">
                                Your public academic profile information.
                            </p>
                        </div>

                        <button
                            onClick={() =>
                                setShowEditModal(true)
                            }
                            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition hover:text-blue-700"
                        >
                            <Pencil size={15} />
                            Edit
                        </button>
                    </div>

                    <div className="profile-about-box mt-6 rounded-2xl bg-slate-50/80 p-5">
                        <p className="leading-8 text-slate-600">
                            {profile.bio ||
                                "No bio added yet. Tell other students about your academic interests, department and what you like to study."}
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 18,
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
                        delay: 0.05,
                    }}
                    className="profile-account-card rounded-[30px] border border-slate-200/80 bg-white p-7 shadow-[0_10px_30px_rgba(15,23,42,0.045)]"
                >
                    <div className="flex items-center gap-2">
                        <ShieldCheck
                            size={18}
                            className="text-blue-600"
                        />

                        <h2 className="text-xl font-black text-slate-800">
                            Account Information
                        </h2>
                    </div>

                    <div className="mt-6 space-y-5">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                                Username
                            </p>

                            <p className="mt-1 break-all font-bold text-slate-700">
                                {profile.username}
                            </p>
                        </div>

                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                                Email
                            </p>

                            <p className="mt-1 break-all font-bold text-slate-700">
                                {profile.email ||
                                    "Not available"}
                            </p>
                        </div>

                        {profile.department && (
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                                    Department
                                </p>

                                <p className="mt-1 font-bold text-slate-700">
                                    {profile.department}
                                </p>
                            </div>
                        )}

                        {profile.date_joined && (
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                                    Joined
                                </p>

                                <div className="mt-1 flex items-center gap-2 font-bold text-slate-700">
                                    <CalendarDays
                                        size={15}
                                        className="text-blue-500"
                                    />

                                    {new Date(
                                        profile.date_joined
                                    ).toLocaleDateString(
                                        undefined,
                                        {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        }
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* =====================================================
                NOTES
            ====================================================== */}

            <div className="mt-12">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <BookOpen size={21} />
                            </div>

                            <div>
                                <h2 className="text-2xl font-black text-slate-800">
                                    My Uploaded Notes
                                </h2>

                                <p className="mt-1 text-sm text-slate-400">
                                    Manage the study resources you have shared.
                                </p>
                            </div>
                        </div>
                    </div>

                    <span className="text-sm font-bold text-slate-400">
                        {notes.length} resources
                    </span>
                </div>

                {notes.length ? (
                    <div className="mt-7 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {notes.map((note, index) => (
                            <motion.div
                                key={note.id}
                                initial={{
                                    opacity: 0,
                                    y: 18,
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
                                    duration: 0.45,
                                    delay:
                                        index * 0.04,
                                }}
                                whileHover={{
                                    y: -5,
                                }}
                                className="profile-note-card group overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                            <FileText size={22} />
                                        </div>

                                        <span className="rounded-full bg-slate-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            {note.department ||
                                                "Note"}
                                        </span>
                                    </div>

                                    <h3 className="mt-5 line-clamp-2 text-lg font-black text-slate-800 transition group-hover:text-blue-600">
                                        {note.title}
                                    </h3>

                                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                                        {note.description ||
                                            "No description available for this note."}
                                    </p>

                                    <div className="mt-5 flex items-center gap-5 border-t border-slate-100 pt-4">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                                            <Eye size={14} />
                                            {note.views || 0}
                                        </div>

                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                                            <Download size={14} />
                                            {note.downloads ||
                                                0}
                                        </div>
                                    </div>
                                </div>

                                <div className="profile-note-actions border-t border-slate-100 bg-slate-50/75 px-6 py-4">
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/note/${note.id}`
                                                )
                                            }
                                            className="profile-note-action h-10 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 transition hover:border-blue-300 hover:text-blue-600"
                                        >
                                            Open
                                        </button>

                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/edit/${note.id}`
                                                )
                                            }
                                            className="profile-note-action h-10 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 transition hover:border-amber-300 hover:text-amber-600"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleDelete(
                                                    note.id
                                                )
                                            }
                                            className="profile-note-action h-10 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 transition hover:border-red-300 hover:text-red-600"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 10,
                        }}
                        whileInView={{
                            opacity: 1,
                            y: 0,
                        }}
                        viewport={{
                            once: true,
                        }}
                        className="profile-empty-notes mt-7 rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm"
                    >
                        <div className="profile-empty-icon mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                            <BookOpen size={28} />
                        </div>

                        <h3 className="mt-5 text-lg font-black text-slate-700">
                            No notes uploaded yet
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                            You haven't shared any study notes yet.
                        </p>

                        <button
                            onClick={() =>
                                navigate("/upload")
                            }
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20"
                        >
                            <BookOpen size={17} />
                            Upload Your First Note
                        </button>
                    </motion.div>
                )}
            </div>

            {/* =====================================================
                BLOGS
            ====================================================== */}

            {blogs.length > 0 && (
                <div className="mt-12">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                            <PenLine size={21} />
                        </div>

                        <div>
                            <h2 className="text-2xl font-black text-slate-800">
                                My Blogs
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                Articles and ideas you have shared.
                            </p>
                        </div>
                    </div>

                    <div className="mt-7 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {blogs.map((blog, index) => (
                            <motion.button
                                key={blog.id}
                                initial={{
                                    opacity: 0,
                                    y: 18,
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
                                    duration: 0.45,
                                    delay:
                                        index * 0.05,
                                }}
                                whileHover={{
                                    y: -5,
                                }}
                                onClick={() =>
                                    navigate(
                                        `/blog/${blog.id}`
                                    )
                                }
                                className="profile-blog-card group rounded-[28px] border border-slate-200/80 bg-white p-6 text-left shadow-sm transition-shadow duration-300 hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-600">
                                        Academic Blog
                                    </span>

                                    <ArrowUpRight
                                        size={18}
                                        className="text-slate-300 transition group-hover:text-orange-500"
                                    />
                                </div>

                                <h3 className="mt-5 line-clamp-2 text-xl font-black text-slate-800 transition group-hover:text-orange-600">
                                    {blog.title}
                                </h3>

                                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                                    {blog.content ||
                                        "No content available."}
                                </p>

                                <p className="mt-5 text-xs font-semibold text-slate-400">
                                    {blog.views || 0} views
                                </p>
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}

            {/* =====================================================
                DISCUSSION
            ====================================================== */}

            <div className="mt-12 grid gap-6 md:grid-cols-2">
                <motion.div
                    whileHover={{
                        y: -4,
                    }}
                    className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-blue-600 to-cyan-500 p-7 text-white shadow-lg shadow-blue-500/15"
                >
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

                    <div className="relative">
                        <MessageSquare size={25} />

                        <h3 className="mt-5 text-2xl font-black">
                            Discussion Rooms
                        </h3>

                        <p className="mt-2 text-blue-100">
                            Rooms you've joined or participated in.
                        </p>

                        <p className="mt-6 text-4xl font-black">
                            {profile.discussion_rooms_count ||
                                0}
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{
                        y: -4,
                    }}
                    className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-violet-600 to-purple-500 p-7 text-white shadow-lg shadow-violet-500/15"
                >
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

                    <div className="relative">
                        <MessageSquare size={25} />

                        <h3 className="mt-5 text-2xl font-black">
                            Messages
                        </h3>

                        <p className="mt-2 text-violet-100">
                            Messages you've contributed to discussions.
                        </p>

                        <p className="mt-6 text-4xl font-black">
                            {profile.discussion_messages_count ||
                                0}
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* =====================================================
                EDIT PROFILE MODAL
            ====================================================== */}

            {showEditModal && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-md sm:items-center sm:p-4">
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 24,
                            scale: 0.98,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        transition={{
                            duration: 0.25,
                        }}
                        className="profile-edit-modal max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-[30px] border border-white/70 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.18)] sm:max-h-[90vh] sm:rounded-[30px]"
                    >
                        <div className="profile-modal-header sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-7 py-5 backdrop-blur">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800">
                                    Edit Profile
                                </h2>

                                <p className="mt-1 text-sm text-slate-400">
                                    Update your personal and academic information.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowEditModal(
                                        false
                                    )
                                }
                                className="profile-modal-close flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSaveProfile}
                            className="space-y-6 p-7"
                        >
                            <div className="profile-photo-editor flex flex-col items-center gap-5 rounded-2xl border border-slate-100 bg-slate-50 p-5 sm:flex-row">
                                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-3xl font-black text-white">
                                    {editForm.photo ? (
                                        <img
                                            src={URL.createObjectURL(
                                                editForm.photo
                                            )}
                                            alt="Preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : profile.photo &&
                                      !editForm.remove_photo ? (
                                        <img
                                            src={getImageUrl(
                                                profile.photo
                                            )}
                                            alt={
                                                profile.username
                                            }
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        firstLetter
                                    )}
                                </div>

                                <div>
                                    <h3 className="font-black text-slate-800">
                                        Profile Photo
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-400">
                                        JPG, PNG or JPEG recommended.
                                    </p>

                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700">
                                            <Camera size={16} />
                                            Choose Photo

                                            <input
                                                type="file"
                                                name="photo"
                                                accept="image/png,image/jpeg,image/jpg"
                                                className="hidden"
                                                onChange={
                                                    handleEditChange
                                                }
                                            />
                                        </label>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setEditForm(
                                                    (
                                                        prev
                                                    ) => ({
                                                        ...prev,
                                                        photo:
                                                            null,
                                                        remove_photo:
                                                            true,
                                                    })
                                                )
                                            }
                                            disabled={
                                                !profile.photo &&
                                                !editForm.photo
                                            }
                                            className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <Trash2 size={16} />
                                            Remove Photo
                                        </button>
                                    </div>

                                    {editForm.photo && (
                                        <p className="mt-2 text-xs font-semibold text-emerald-600">
                                            New photo selected:{" "}
                                            {
                                                editForm.photo
                                                    .name
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="text-sm font-bold text-slate-700">
                                        Username
                                    </label>

                                    <input
                                        type="text"
                                        name="username"
                                        value={
                                            editForm.username
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                        required
                                        className="profile-form-control mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-slate-700">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={
                                            editForm.email
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                        required
                                        className="profile-form-control mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700">
                                    Bio
                                </label>

                                <textarea
                                    name="bio"
                                    rows="4"
                                    value={editForm.bio}
                                    onChange={
                                        handleEditChange
                                    }
                                    placeholder="Tell other students a little about yourself..."
                                    className="profile-form-control mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="text-sm font-bold text-slate-700">
                                        Department
                                    </label>

                                    <select
                                        name="department"
                                        value={
                                            editForm.department
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                        className="profile-form-control mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    >
                                        <option value="">
                                            Select Department
                                        </option>
                                        <option value="CSE">
                                            CSE
                                        </option>
                                        <option value="EEE">
                                            EEE
                                        </option>
                                        <option value="BBA">
                                            BBA
                                        </option>
                                        <option value="English">
                                            English
                                        </option>
                                        <option value="Law">
                                            Law
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-slate-700">
                                        Location
                                    </label>

                                    <input
                                        type="text"
                                        name="location"
                                        value={
                                            editForm.location
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                        placeholder="Dhaka, Bangladesh"
                                        className="profile-form-control mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-black text-slate-800">
                                    Social & Professional Links
                                </h3>

                                <p className="mt-1 text-sm text-slate-400">
                                    Add links you want other students to see.
                                </p>

                                <div className="mt-4 grid gap-5 md:grid-cols-2">
                                    <input
                                        type="url"
                                        name="website"
                                        value={
                                            editForm.website
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                        placeholder="Website URL"
                                        className="profile-form-control h-12 rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    />

                                    <input
                                        type="url"
                                        name="linkedin"
                                        value={
                                            editForm.linkedin
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                        placeholder="LinkedIn URL"
                                        className="profile-form-control h-12 rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    />

                                    <input
                                        type="url"
                                        name="github"
                                        value={
                                            editForm.github
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                        placeholder="GitHub URL"
                                        className="profile-form-control h-12 rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    />

                                    <input
                                        type="url"
                                        name="facebook"
                                        value={
                                            editForm.facebook
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                        placeholder="Facebook URL"
                                        className="profile-form-control h-12 rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-slate-100 pt-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowEditModal(
                                            false
                                        )
                                    }
                                    className="rounded-xl bg-slate-100 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-200"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={savingProfile}
                                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-black text-white transition hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {savingProfile ? (
                                        <>
                                            <Loader2
                                                size={17}
                                                className="animate-spin"
                                            />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={17} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* =====================================================
                PASSWORD MODAL
            ====================================================== */}

            {showPasswordModal && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-md sm:items-center sm:p-4">
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 24,
                            scale: 0.98,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        transition={{
                            duration: 0.25,
                        }}
                        className="profile-password-modal max-h-[94vh] w-full max-w-lg overflow-y-auto rounded-t-[30px] bg-white shadow-[0_25px_80px_rgba(15,23,42,0.18)] sm:rounded-[30px]"
                    >
                        <div className="profile-password-header flex items-center justify-between border-b border-slate-100 px-7 py-5">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800">
                                    Change Password
                                </h2>

                                <p className="mt-1 text-sm text-slate-400">
                                    Keep your NoteShare account secure.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPasswordModal(
                                        false
                                    )
                                }
                                className="profile-modal-close flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <form
                            onSubmit={
                                handleChangePassword
                            }
                            className="space-y-5 p-7"
                        >
                            <div className="profile-password-info flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                                <ShieldCheck
                                    size={19}
                                    className="mt-0.5 shrink-0 text-blue-600"
                                />

                                <p className="text-sm leading-6 text-blue-700">
                                    After changing your password, you'll be asked to log in again.
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700">
                                    Current Password
                                </label>

                                <input
                                    type="password"
                                    name="current_password"
                                    value={
                                        passwordForm.current_password
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    required
                                    className="profile-form-control mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700">
                                    New Password
                                </label>

                                <input
                                    type="password"
                                    name="new_password"
                                    value={
                                        passwordForm.new_password
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    required
                                    minLength={6}
                                    className="profile-form-control mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700">
                                    Confirm New Password
                                </label>

                                <input
                                    type="password"
                                    name="confirm_password"
                                    value={
                                        passwordForm.confirm_password
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    required
                                    minLength={6}
                                    className="profile-form-control mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                            </div>

                            <div className="flex justify-end gap-3 border-t border-slate-100 pt-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPasswordModal(
                                            false
                                        )
                                    }
                                    className="profile-modal-cancel rounded-xl bg-slate-100 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-200"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={changingPassword}
                                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-black text-white transition hover:bg-slate-800 disabled:opacity-50"
                                >
                                    {changingPassword ? (
                                        <>
                                            <Loader2
                                                size={17}
                                                className="animate-spin"
                                            />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={17} />
                                            Change Password
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* =====================================================
                DANGER ZONE
            ====================================================== */}

            <motion.div
                initial={{
                    opacity: 0,
                }}
                whileInView={{
                    opacity: 1,
                }}
                viewport={{
                    once: true,
                    amount: 0.15,
                }}
                className="profile-danger mt-12 rounded-[30px] border border-red-100 bg-gradient-to-br from-red-50 to-white p-7 shadow-sm"
            >
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-xl font-black text-red-700">
                            Danger Zone
                        </h2>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-red-600/80">
                            Permanently delete your NoteShare account and associated content. This action cannot be undone.
                        </p>
                    </div>

                    <button
                        onClick={handleDeleteAccount}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-black text-white transition hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/20"
                    >
                        <Trash2 size={18} />
                        Permanently Delete Account
                    </button>
                </div>
            </motion.div>
        </section>
    );
}

export default Profile;