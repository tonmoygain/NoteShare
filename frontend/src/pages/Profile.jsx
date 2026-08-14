import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

import {
    User,
    Mail,
    BookOpen,
    Eye,
    Download,
    CalendarDays,
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

        return `http://127.0.0.1:8000${photo}`;

    };


    const loadProfile = async () => {

        try {

            setLoading(true);
            setError("");

            const token =
                localStorage.getItem("access");

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

            console.error(
                "Profile API Error:",
                err
            );

            if (
                err.response?.status === 401
            ) {

                localStorage.removeItem(
                    "access"
                );

                localStorage.removeItem(
                    "refresh"
                );

                localStorage.removeItem(
                    "username"
                );

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

            await API.delete(
                `notes/delete/${id}/`
            );

            setProfile((prev) => {

                if (!prev) return prev;

                const updatedNotes =
                    (prev.user_notes || []).filter(
                        (note) => note.id !== id
                    );

                return {
                    ...prev,
                    user_notes: updatedNotes,
                    total_notes:
                        Math.max(
                            (prev.total_notes || 1) - 1,
                            0
                        ),
                };

            });

        } catch (err) {

            console.error(
                "Delete Note Error:",
                err
            );

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

        await API.delete(
            "profile/delete-account/"
        );


        localStorage.removeItem(
            "access"
        );

        localStorage.removeItem(
            "refresh"
        );

        localStorage.removeItem(
            "username"
        );


        alert(
            "Your account has been deleted successfully."
        );


        navigate("/");

        window.location.reload();

    } catch (err) {

        console.error(
            "Delete Account Error:",
            err
        );


        if (
            err.response?.status === 401
        ) {

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

    }};


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

            formData.append(
                "bio",
                editForm.bio
            );

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
                editForm.remove_photo ? "true" : "false"
            );

            if (editForm.photo) {

                formData.append(
                    "photo",
                    editForm.photo
                );

            }

            const response =
                await API.put(
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

            /*
             * Header uses localStorage on mount.
             * Reload to immediately reflect updated
             * username/avatar state everywhere.
             */

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


    const handlePasswordChange = (
        e
    ) => {

        setPasswordForm((prev) => ({
            ...prev,
            [e.target.name]:
                e.target.value,
        }));

    };


    const handleChangePassword = async (
        e
    ) => {

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

            /*
             * Existing JWT may still be valid, but forcing
             * login again is cleaner after password change.
             */

            localStorage.removeItem(
                "access"
            );

            localStorage.removeItem(
                "refresh"
            );

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


    if (loading) {

        return (

            <div className="min-h-[70vh] flex items-center justify-center px-6">

                <div className="text-center">

                    <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">

                        <Loader2
                            size={30}
                            className="animate-spin"
                        />

                    </div>

                    <h2 className="text-lg font-black text-slate-700 mt-5">
                        Loading Profile
                    </h2>

                    <p className="text-sm text-slate-400 mt-2">
                        Please wait while we load your profile.
                    </p>

                </div>

            </div>

        );

    }


    if (error) {

        return (

            <div className="min-h-[70vh] flex items-center justify-center px-6">

                <div className="bg-white rounded-[30px] shadow-xl p-10 text-center max-w-lg w-full">

                    <h2 className="text-3xl font-black text-slate-800">
                        Profile Error
                    </h2>

                    <p className="text-slate-500 mt-4">
                        {error}
                    </p>

                    <button
                        onClick={() =>
                            window.location.reload()
                        }
                        className="mt-7 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold"
                    >
                        Try Again
                    </button>

                </div>

            </div>

        );

    }


    if (!profile) {
        return null;
    }


    const notes =
        profile.user_notes || [];

    const blogs =
        profile.user_blogs || [];

    const firstLetter =
        (
            profile.username ||
            "U"
        )
            .charAt(0)
            .toUpperCase();


    return (

        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

            {/* =====================================================
                PROFILE HEADER
            ====================================================== */}

            <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-800 text-white shadow-2xl">

                <div className="absolute -top-28 -right-20 w-96 h-96 rounded-full bg-cyan-400/15 blur-3xl"></div>

                <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-blue-500/15 blur-3xl"></div>


                <div className="relative p-8 md:p-10">

                    <div className="flex flex-col lg:flex-row gap-8 lg:items-center">

                        {/* Avatar */}

                        <div className="relative shrink-0">

                            <div className="w-32 h-32 rounded-full bg-white/10 border-4 border-white/20 overflow-hidden flex items-center justify-center shadow-2xl">

                                {profile.photo ? (

                                    <img
                                        src={getImageUrl(
                                            profile.photo
                                        )}
                                        alt={
                                            profile.username
                                        }
                                        className="w-full h-full object-cover"
                                    />

                                ) : (

                                    <span className="text-5xl font-black">
                                        {firstLetter}
                                    </span>

                                )}

                            </div>

                            <button
                                onClick={() =>
                                    setShowEditModal(
                                        true
                                    )
                                }
                                className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-white text-blue-700 shadow-lg flex items-center justify-center hover:scale-105 transition"
                                title="Edit profile"
                            >
                                <Camera size={18} />
                            </button>

                        </div>


                        {/* Profile Identity */}

                        <div className="flex-1 min-w-0">

                            <div className="flex flex-wrap gap-2">

                                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm font-bold">

                                    <ShieldCheck
                                        size={15}
                                    />

                                    Student Profile

                                </span>


                                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-400/10 border border-emerald-300/10 text-emerald-200 text-sm font-bold">

                                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>

                                    Active

                                </span>

                            </div>


                            <h1 className="text-4xl md:text-5xl font-black mt-5 break-words">

                                {profile.username}

                            </h1>


                            {profile.bio ? (

                                <p className="text-blue-100 mt-4 text-base md:text-lg leading-7 max-w-3xl">

                                    {profile.bio}

                                </p>

                            ) : (

                                <p className="text-blue-200/70 mt-4">

                                    Add a short bio to tell other students about yourself.

                                </p>

                            )}


                            <div className="flex flex-wrap gap-4 mt-5 text-sm text-blue-100">

                                {profile.email && (

                                    <span className="inline-flex items-start gap-2 text-blue-100 text-sm break-all">

                                        <Mail size={16} />

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

                        <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">

                            <button
                                onClick={() =>
                                    setShowEditModal(
                                        true
                                    )
                                }
                                className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-xl font-black transition shadow-lg"
                            >

                                <Pencil size={18} />

                                Edit Profile

                            </button>

                            {profile.has_usable_password ? (

                                <button
                                    onClick={() =>
                                        setShowPasswordModal(true)
                                    }
                                    className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white px-6 py-3 rounded-xl font-bold transition"
                                >
                                    <Lock size={18} />

                                    Change Password

                                </button>
                            ) : (
                                <div className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-blue-100 px-6 py-3 rounded-xl font-bold">

                                    <ShieldCheck size={18} />

                                    Signed in with Google
                                </div>

                            )}

                        </div>

                    </div>


                    {/* Social Links */}

                    {(profile.website ||
                        profile.linkedin ||
                        profile.github ||
                        profile.facebook) && (

                        <div className="flex flex-wrap gap-2.5 mt-8 pt-6 border-t border-white/10">

                            {profile.website && (

                                <a
                                    href={profile.website}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 px-4 py-2.5 rounded-xl text-sm font-bold transition"
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
                                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 px-4 py-2.5 rounded-xl text-sm font-bold transition"
                                >

                                    <span className="font-black text-sm">

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
                                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 px-4 py-2.5 rounded-xl text-sm font-bold transition"
                                >

                                    <span className="font-black text-sm">

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
                                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 px-4 py-2.5 rounded-xl text-sm font-bold transition"
                                >

                                    <span className="font-black text-sm">

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

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-7">

                <div className="bg-white border border-slate-100 rounded-[26px] p-6 shadow-sm">

                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">

                        <BookOpen size={21} />

                    </div>

                    <p className="text-xs uppercase font-black tracking-wider text-slate-400 mt-5">
                        Uploaded Notes
                    </p>

                    <p className="text-4xl font-black text-slate-800 mt-1">
                        {profile.total_notes || 0}
                    </p>

                </div>


                <div className="bg-white border border-slate-100 rounded-[26px] p-6 shadow-sm">

                    <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">

                        <Eye size={21} />

                    </div>

                    <p className="text-xs uppercase font-black tracking-wider text-slate-400 mt-5">
                        Note Views
                    </p>

                    <p className="text-4xl font-black text-slate-800 mt-1">
                        {profile.total_views || 0}
                    </p>

                </div>


                <div className="bg-white border border-slate-100 rounded-[26px] p-6 shadow-sm">

                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">

                        <Download size={21} />

                    </div>

                    <p className="text-xs uppercase font-black tracking-wider text-slate-400 mt-5">
                        Downloads
                    </p>

                    <p className="text-4xl font-black text-slate-800 mt-1">
                        {profile.total_downloads || 0}
                    </p>

                </div>


                <div className="bg-white border border-slate-100 rounded-[26px] p-6 shadow-sm">

                    <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">

                        <PenLine size={21} />

                    </div>

                    <p className="text-xs uppercase font-black tracking-wider text-slate-400 mt-5">
                        Blogs
                    </p>

                    <p className="text-4xl font-black text-slate-800 mt-1">
                        {blogs.length}
                    </p>

                </div>

            </div>


            {/* =====================================================
                ABOUT + ACCOUNT
            ====================================================== */}

            <div className="grid lg:grid-cols-[1fr_340px] gap-7 mt-8">

                <div className="bg-white border border-slate-100 rounded-[30px] shadow-sm p-7">

                    <div className="flex items-center justify-between">

                        <div>

                            <h2 className="text-2xl font-black text-slate-800">
                                About
                            </h2>

                            <p className="text-sm text-slate-400 mt-1">
                                Your public academic profile information.
                            </p>

                        </div>

                        <button
                            onClick={() =>
                                setShowEditModal(
                                    true
                                )
                            }
                            className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm"
                        >
                            <Pencil size={15} />
                            Edit
                        </button>

                    </div>


                    <div className="mt-6">

                        <p className="text-slate-600 leading-8">

                            {profile.bio ||
                                "No bio added yet. Tell other students about your academic interests, department and what you like to study."}

                        </p>

                    </div>

                </div>


                <div className="bg-white border border-slate-100 rounded-[30px] shadow-sm p-7">

                    <h2 className="text-xl font-black text-slate-800">
                        Account Information
                    </h2>

                    <div className="space-y-5 mt-6">

                        <div>

                            <p className="text-xs uppercase font-black tracking-wider text-slate-400">
                                Username
                            </p>

                            <p className="font-bold text-slate-700 mt-1 break-all">
                                {profile.username}
                            </p>

                        </div>


                        <div>

                            <p className="text-xs uppercase font-black tracking-wider text-slate-400">
                                Email
                            </p>

                            <p className="font-bold text-slate-700 mt-1 break-all">
                                {profile.email ||
                                    "Not available"}
                            </p>

                        </div>


                        {profile.department && (

                            <div>

                                <p className="text-xs uppercase font-black tracking-wider text-slate-400">
                                    Department
                                </p>

                                <p className="font-bold text-slate-700 mt-1">
                                    {profile.department}
                                </p>

                            </div>

                        )}


                        {profile.date_joined && (

                            <div>

                                <p className="text-xs uppercase font-black tracking-wider text-slate-400">
                                    Joined
                                </p>

                                <p className="font-bold text-slate-700 mt-1">

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

                                </p>

                            </div>

                        )}

                    </div>

                </div>

            </div>


            {/* =====================================================
                MY UPLOADED NOTES
            ====================================================== */}

            <div className="mt-12">

                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">

                    <div>

                        <div className="flex items-center gap-3">

                            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">

                                <BookOpen size={21} />

                            </div>

                            <div>

                                <h2 className="text-2xl font-black text-slate-800">
                                    My Uploaded Notes
                                </h2>

                                <p className="text-sm text-slate-400 mt-1">
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

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-7">

                        {notes.map((note) => (

                            <div
                                key={note.id}
                                className="group bg-white border border-slate-100 rounded-[28px] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >

                                <div className="p-6">

                                    <div className="flex items-start justify-between gap-4">

                                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">

                                            <FileText size={22} />

                                        </div>

                                        <span className="text-[10px] uppercase tracking-wider font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">
                                            {note.department ||
                                                "Note"}
                                        </span>

                                    </div>


                                    <h3 className="text-lg font-black text-slate-800 mt-5 line-clamp-2 group-hover:text-blue-600 transition">
                                        {note.title}
                                    </h3>


                                    <p className="text-sm text-slate-500 leading-6 mt-2 line-clamp-3">
                                        {note.description ||
                                            "No description available for this note."}
                                    </p>


                                    <div className="flex items-center gap-5 mt-5 pt-4 border-t border-slate-100">

                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">

                                            <Eye size={14} />

                                            {note.views || 0}

                                        </div>


                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">

                                            <Download size={14} />

                                            {note.downloads || 0}

                                        </div>

                                    </div>

                                </div>


                                <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100">

                                    <div className="grid grid-cols-3 gap-2">

                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/note/${note.id}`
                                                )
                                            }
                                            className="h-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 font-bold text-xs transition"
                                        >
                                            Open
                                        </button>


                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/edit/${note.id}`
                                                )
                                            }
                                            className="h-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-600 font-bold text-xs transition"
                                        >
                                            Edit
                                        </button>


                                        <button
                                            onClick={() =>
                                                handleDelete(
                                                    note.id
                                                )
                                            }
                                            className="h-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:border-red-300 hover:text-red-600 font-bold text-xs transition"
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                ) : (

                    <div className="mt-7 bg-white border border-dashed border-slate-200 rounded-[28px] p-12 text-center">

                        <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center">

                            <BookOpen size={28} />

                        </div>

                        <h3 className="font-black text-slate-700 text-lg mt-5">
                            No notes uploaded yet
                        </h3>

                        <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto leading-6">
                            You haven't shared any study notes yet.
                        </p>

                        <button
                            onClick={() =>
                                navigate("/upload")
                            }
                            className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold transition"
                        >
                            <BookOpen size={17} />
                            Upload Your First Note
                        </button>

                    </div>

                )}

            </div>


            {/* =====================================================
                MY BLOGS
            ====================================================== */}

            {blogs.length > 0 && (

                <div className="mt-12">

                    <div className="flex items-center gap-3">

                        <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">

                            <PenLine size={21} />

                        </div>

                        <div>

                            <h2 className="text-2xl font-black text-slate-800">
                                My Blogs
                            </h2>

                            <p className="text-sm text-slate-400 mt-1">
                                Articles and ideas you have shared.
                            </p>

                        </div>

                    </div>


                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-7">

                        {blogs.map((blog) => (

                            <button
                                key={blog.id}
                                onClick={() =>
                                    navigate(
                                        `/blog/${blog.id}`
                                    )
                                }
                                className="text-left bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
                            >

                                <span className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full text-xs font-bold">
                                    Academic Blog
                                </span>

                                <h3 className="text-xl font-black text-slate-800 mt-5 line-clamp-2">
                                    {blog.title}
                                </h3>

                                <p className="text-sm text-slate-500 mt-3 line-clamp-3 leading-6">
                                    {blog.content ||
                                        "No content available."}
                                </p>

                                <p className="text-xs text-slate-400 font-semibold mt-5">
                                    {blog.views || 0} views
                                </p>

                            </button>

                        ))}

                    </div>

                </div>

            )}


            {/* =====================================================
                DISCUSSION ACTIVITY
            ====================================================== */}

            <div className="mt-12 grid md:grid-cols-2 gap-6">

                <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-[30px] p-7 text-white shadow-lg">

                    <MessageSquare size={25} />

                    <h3 className="text-2xl font-black mt-5">
                        Discussion Rooms
                    </h3>

                    <p className="text-blue-100 mt-2">
                        Rooms you've joined or participated in.
                    </p>

                    <p className="text-4xl font-black mt-6">
                        {profile.discussion_rooms_count || 0}
                    </p>

                </div>


                <div className="bg-gradient-to-br from-violet-600 to-purple-500 rounded-[30px] p-7 text-white shadow-lg">

                    <MessageSquare size={25} />

                    <h3 className="text-2xl font-black mt-5">
                        Messages
                    </h3>

                    <p className="text-violet-100 mt-2">
                        Messages you've contributed to discussions.
                    </p>

                    <p className="text-4xl font-black mt-6">
                        {profile.discussion_messages_count || 0}
                    </p>

                </div>

            </div>


            {/* =====================================================
                EDIT PROFILE MODAL
            ====================================================== */}

            {showEditModal && (

                <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">

                    <div className="w-full max-w-3xl max-h-[94vh] sm:max-h-[90vh] overflow-y-auto bg-white rounded-t-[30px] sm:rounded-[30px] shadow-2xl">

                        <div className="sticky top-0 z-10 flex items-center justify-between px-7 py-5 bg-white border-b border-slate-100">

                            <div>

                                <h2 className="text-2xl font-black text-slate-800">
                                    Edit Profile
                                </h2>

                                <p className="text-sm text-slate-400 mt-1">
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
                                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
                            >
                                <X size={19} />
                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleSaveProfile
                            }
                            className="p-7 space-y-6"
                        >

                            {/* Photo */}

                            <div className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl bg-slate-50 border border-slate-100">

                                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center text-3xl font-black shrink-0">

                                    {editForm.photo ? (

                                        <img
                                            src={URL.createObjectURL(editForm.photo)}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />

                                    ) : profile.photo && !editForm.remove_photo ? (

                                        <img
                                            src={getImageUrl(profile.photo)}
                                            alt={profile.username}
                                            className="w-full h-full object-cover"
                                        />

                                    ) : (

                                        firstLetter

                                    )}

                                </div>


                                <div>

                                    <h3 className="font-black text-slate-800">
                                        Profile Photo
                                    </h3>

                                    <p className="text-sm text-slate-400 mt-1">
                                        JPG, PNG or JPEG recommended.
                                    </p>

                                    <div className="mt-3 flex flex-wrap items-center gap-2">

                                        {/* Choose Photo */}

                                        <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold cursor-pointer">

                                            <Camera size={16} />

                                            Choose Photo

                                            <input
                                                type="file"
                                                name="photo"
                                                accept="image/png,image/jpeg,image/jpg"
                                                className="hidden"
                                                onChange={handleEditChange}
                                            />

                                        </label>

                                        {/* Remove Photo */}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setEditForm((prev) => ({
                                                    ...prev,
                                                    photo: null,
                                                    remove_photo: true,
                                                }))
                                            }
                                            disabled={
                                                !profile.photo &&
                                                !editForm.photo
                                            }
                                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-bold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <Trash2 size={16} />

                                            Remove Photo

                                        </button>

                                    </div>

                                    {/* Selected new photo */}

                                    {editForm.photo && (

                                        <p className="text-xs text-emerald-600 font-semibold mt-2">

                                            New photo selected:{" "}

                                            {editForm.photo.name}

                                        </p>

                                    )}

                                </div>

                            </div>


                            {/* Username / Email */}

                            <div className="grid md:grid-cols-2 gap-5">

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
                                        className="w-full mt-2 h-12 border border-slate-200 rounded-xl px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                                        className="w-full mt-2 h-12 border border-slate-200 rounded-xl px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    />

                                </div>

                            </div>


                            {/* Bio */}

                            <div>

                                <label className="text-sm font-bold text-slate-700">
                                    Bio
                                </label>

                                <textarea
                                    name="bio"
                                    rows="4"
                                    value={
                                        editForm.bio
                                    }
                                    onChange={
                                        handleEditChange
                                    }
                                    placeholder="Tell other students a little about yourself..."
                                    className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3 outline-none resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />

                            </div>


                            {/* Academic */}

                            <div className="grid md:grid-cols-2 gap-5">

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
                                        className="w-full mt-2 h-12 border border-slate-200 rounded-xl px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                                        className="w-full mt-2 h-12 border border-slate-200 rounded-xl px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    />

                                </div>

                            </div>


                            {/* Social */}

                            <div>

                                <h3 className="text-lg font-black text-slate-800">
                                    Social & Professional Links
                                </h3>

                                <p className="text-sm text-slate-400 mt-1">
                                    Add links you want other students to see.
                                </p>

                                <div className="grid md:grid-cols-2 gap-5 mt-4">

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
                                        className="h-12 border border-slate-200 rounded-xl px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                                        className="h-12 border border-slate-200 rounded-xl px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                                        className="h-12 border border-slate-200 rounded-xl px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                                        className="h-12 border border-slate-200 rounded-xl px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    />

                                </div>

                            </div>


                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowEditModal(
                                            false
                                        )
                                    }
                                    className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    disabled={
                                        savingProfile
                                    }
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black disabled:opacity-50"
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
                                            <Save
                                                size={17}
                                            />

                                            Save Changes

                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =====================================================
                CHANGE PASSWORD MODAL
            ====================================================== */}

            {showPasswordModal && (

                <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">

                    <div className="w-full max-w-lg max-h-[94vh] overflow-y-auto bg-white rounded-t-[30px] sm:rounded-[30px] shadow-2xl">

                        <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between">

                            <div>

                                <h2 className="text-2xl font-black text-slate-800">
                                    Change Password
                                </h2>

                                <p className="text-sm text-slate-400 mt-1">
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
                                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
                            >
                                <X size={19} />
                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleChangePassword
                            }
                            className="p-7 space-y-5"
                        >

                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">

                                <ShieldCheck
                                    size={19}
                                    className="text-blue-600 shrink-0 mt-0.5"
                                />

                                <p className="text-sm text-blue-700 leading-6">
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
                                    className="w-full mt-2 h-12 border border-slate-200 rounded-xl px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                                    className="w-full mt-2 h-12 border border-slate-200 rounded-xl px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                                    className="w-full mt-2 h-12 border border-slate-200 rounded-xl px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />

                            </div>


                            <div className="flex justify-end gap-3 pt-3">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPasswordModal(
                                            false
                                        )
                                    }
                                    className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    disabled={
                                        changingPassword
                                    }
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-black disabled:opacity-50"
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

                    </div>

                </div>

            )}


            {/* =====================================================
                DANGER ZONE
            ====================================================== */}

            <div className="mt-12 bg-red-50 border border-red-100 rounded-[30px] p-7">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                    <div>

                        <h2 className="text-xl font-black text-red-700">
                            Danger Zone
                        </h2>

                        <p className="text-sm text-red-600/80 mt-2 max-w-2xl leading-6">

                            Permanently delete your NoteShare account and
                            associated content. This action cannot be undone.

                        </p>

                    </div>


                    <button
                        onClick={handleDeleteAccount}
                        className="shrink-0 inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-black transition"
                    >

                        <Trash2 size={18} />

                        Permanently Delete Account

                    </button>

                </div>

            </div>

        </section>

    );

}

export default Profile;