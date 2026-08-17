import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
    Download,
    Pencil,
    Trash2,
    CalendarDays,
    User,
    Eye,
    ArrowLeft,
    FileText,
    Loader2,
    BookOpen,
} from "lucide-react";

import API from "../services/api";

function NoteDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchNote = async () => {

            try {

                setLoading(true);
                setError("");

                const response = await API.get(
                    `notes/${id}/`
                );

                setNote(response.data);

            } catch (err) {

                console.error(
                    "Note Details Error:",
                    err
                );

                if (err.response?.status === 404) {

                    setError(
                        "This note could not be found."
                    );

                } else {

                    setError(
                        err.response?.data?.detail ||
                        "Failed to load note details."
                    );

                }

            } finally {

                setLoading(false);

            }

        };

        fetchNote();

    }, [id]);


    const isOwner = useMemo(() => {

        if (!note) return false;

        const loggedInUsername =
            localStorage
                .getItem("username")
                ?.trim()
                .toLowerCase();

        const uploaderUsername =
            note?.uploader_name
                ?.trim()
                .toLowerCase();

        return Boolean(
            loggedInUsername &&
            uploaderUsername &&
            loggedInUsername === uploaderUsername
        );

    }, [note]);


    const handleDelete = async () => {

        if (!note || deleting) return;

        const confirmed = window.confirm(
            "Are you sure you want to delete this note?"
        );

        if (!confirmed) return;

        try {

            setDeleting(true);

            await API.delete(
                `notes/delete/${note.id}/`
            );

            alert(
                "Note deleted successfully."
            );

            navigate("/notes");

        } catch (err) {

            console.error(
                "Delete Note Error:",
                err
            );

            if (err.response?.status === 401) {

                alert(
                    "Please login first."
                );

                navigate("/login");

            } else if (
                err.response?.status === 403
            ) {

                alert(
                    "You do not have permission to delete this note."
                );

            } else {

                alert(
                    err.response?.data?.detail ||
                    err.response?.data?.error ||
                    "Delete failed."
                );

            }

        } finally {

            setDeleting(false);

        }

    };


    if (loading) {

        return (

            <div className="min-h-[70vh] flex items-center justify-center px-6">

                <div className="text-center">

                    <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">

                        <Loader2
                            size={32}
                            className="animate-spin"
                        />

                    </div>

                    <h2 className="text-lg font-black text-slate-700 mt-5">

                        Loading Note

                    </h2>

                    <p className="text-sm text-slate-400 mt-2">

                        Please wait while we load the study resource.

                    </p>

                </div>

            </div>

        );

    }


    if (error || !note) {

        return (

            <div className="min-h-[70vh] flex items-center justify-center px-6">

                <div className="max-w-lg w-full bg-white border border-slate-100 rounded-[30px] shadow-xl p-10 text-center">

                    <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">

                        <FileText size={28} />

                    </div>

                    <h2 className="text-2xl font-black text-slate-800 mt-5">

                        Note Not Found

                    </h2>

                    <p className="text-slate-500 mt-3 leading-7">

                        {error ||
                            "The requested study note is unavailable."}

                    </p>

                    <button
                        onClick={() =>
                            navigate("/notes")
                        }
                        className="mt-7 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition"
                    >

                        <ArrowLeft size={18} />

                        Back to Notes

                    </button>

                </div>

            </div>

        );

    }


    const uploadedDate = note.uploaded_at
        ? new Date(
              note.uploaded_at
          ).toLocaleDateString(
              undefined,
              {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
              }
          )
        : "Unknown date";


    return (

        <section className="max-w-6xl mx-auto px-6 py-10">

            {/* Back */}

            <button
                onClick={() => navigate("/notes")}
                className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold transition"
            >

                <ArrowLeft size={18} />

                Back to Notes

            </button>


            {/* Main Card */}

            <article className="mt-7 bg-white border border-slate-100 rounded-[32px] shadow-xl overflow-hidden">


                {/* Hero */}

                <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-800">

                    <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl"></div>

                    <div className="absolute -bottom-28 -left-20 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl"></div>


                    <div className="relative px-7 md:px-12 py-12 md:py-16">

                        <div className="flex flex-col md:flex-row md:items-center gap-6">

                            <div className="w-24 h-24 shrink-0 rounded-[28px] bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white shadow-xl">

                                <FileText size={42} />

                            </div>


                            <div className="min-w-0">

                                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-blue-100 px-4 py-2 rounded-full text-sm font-bold">

                                    <BookOpen size={15} />

                                    Study Note

                                </div>


                                <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mt-5 break-words">

                                    {note.title}

                                </h1>


                                <div className="flex flex-wrap gap-3 mt-5">

                                    {note.department && (

                                        <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-blue-100 text-xs font-bold">

                                            {note.department}

                                        </span>

                                    )}

                                    {note.category && (

                                        <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-cyan-100 text-xs font-bold">

                                            {note.category}

                                        </span>

                                    )}

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* Body */}

                <div className="p-7 md:p-10 lg:p-12">


                    {/* Meta */}

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">

                            <div className="flex items-center gap-2 text-slate-400">

                                <CalendarDays size={17} />

                                <span className="text-xs font-bold uppercase tracking-wider">

                                    Uploaded

                                </span>

                            </div>

                            <p className="font-bold text-slate-700 mt-2">

                                {uploadedDate}

                            </p>

                        </div>


                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">

                            <div className="flex items-center gap-2 text-slate-400">

                                <User size={17} />

                                <span className="text-xs font-bold uppercase tracking-wider">

                                    Uploaded By

                                </span>

                            </div>

                            <p className="font-bold text-slate-700 mt-2 truncate">

                                {note.uploader_name ||
                                    "Unknown"}

                            </p>

                        </div>


                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">

                            <div className="flex items-center gap-2 text-slate-400">

                                <Eye size={17} />

                                <span className="text-xs font-bold uppercase tracking-wider">

                                    Views

                                </span>

                            </div>

                            <p className="text-2xl font-black text-slate-800 mt-1">

                                {note.views || 0}

                            </p>

                        </div>


                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">

                            <div className="flex items-center gap-2 text-slate-400">

                                <Download size={17} />

                                <span className="text-xs font-bold uppercase tracking-wider">

                                    Downloads

                                </span>

                            </div>

                            <p className="text-2xl font-black text-slate-800 mt-1">

                                {note.downloads || 0}

                            </p>

                        </div>

                    </div>


                    {/* Description */}

                    <div className="mt-9">

                        <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">

                                <FileText size={19} />

                            </div>

                            <div>

                                <h2 className="text-xl font-black text-slate-800">

                                    Description

                                </h2>

                                <p className="text-xs text-slate-400 mt-1">

                                    About this study resource

                                </p>

                            </div>

                        </div>


                        <div className="mt-5 bg-slate-50/70 border border-slate-100 rounded-[24px] p-6 md:p-8">

                            <p className="text-base md:text-lg leading-8 text-slate-700 whitespace-pre-line">

                                {note.description ||
                                    "No description provided."}

                            </p>

                        </div>

                    </div>


                    {/* Download */}

                    <div className="mt-9 relative overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 to-cyan-500 p-7 md:p-8 text-white">

                        <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-white/10"></div>

                        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">

                            <div>

                                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full text-xs font-bold">

                                    <Download size={14} />

                                    Study Offline

                                </div>

                                <h3 className="text-2xl font-black mt-4">

                                    Download this note

                                </h3>

                                <p className="text-blue-100 mt-2 leading-6">

                                    Get the original file for offline study.

                                </p>

                            </div>


                            <a
                                href={`${API.defaults.baseURL}notes/download/${note.id}/`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 inline-flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-6 py-3.5 rounded-xl font-black transition shadow-lg"
                            >

                                <Download size={18} />

                                Download Note

                            </a>

                        </div>

                    </div>


                    {/* Owner Actions */}

                    {isOwner && (

                        <div className="mt-9 bg-slate-50 border border-slate-200 rounded-[28px] p-6">

                            <div className="flex items-center gap-3 mb-5">

                                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">

                                    <Pencil size={18} />

                                </div>

                                <div>

                                    <h3 className="font-black text-slate-800">

                                        Manage Your Note

                                    </h3>

                                    <p className="text-xs text-slate-400 mt-1">

                                        Edit or remove your uploaded resource.

                                    </p>

                                </div>

                            </div>


                            <div className="grid sm:grid-cols-2 gap-3">

                                <button
                                    onClick={() =>
                                        navigate(
                                            `/edit/${note.id}`
                                        )
                                    }
                                    className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-3.5 rounded-xl font-bold transition"
                                >

                                    <Pencil size={18} />

                                    Edit Note

                                </button>


                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3.5 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >

                                    {deleting ? (

                                        <>
                                            <Loader2
                                                size={18}
                                                className="animate-spin"
                                            />

                                            Deleting...

                                        </>

                                    ) : (

                                        <>
                                            <Trash2 size={18} />

                                            Delete Note

                                        </>

                                    )}

                                </button>

                            </div>

                        </div>

                    )}

                </div>

            </article>

        </section>

    );

}

export default NoteDetails;