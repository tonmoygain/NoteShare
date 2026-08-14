import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    FileText,
    Upload,
    ArrowLeft,
    Save,
    Loader2,
    Eye,
} from "lucide-react";

import API from "../services/api";

function EditNote() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState("");
    const [department, setDepartment] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);
    const [oldFile, setOldFile] = useState("");

    const [error, setError] = useState("");


    useEffect(() => {

        const loadNote = async () => {

            try {

                setLoading(true);
                setError("");

                const response = await API.get(
                    `notes/${id}/`
                );

                setTitle(
                    response.data.title || ""
                );

                setDepartment(
                    response.data.department || ""
                );

                setDescription(
                    response.data.description || ""
                );

                setOldFile(
                    response.data.file || ""
                );

            } catch (err) {

                console.error(
                    "Edit Note Load Error:",
                    err
                );

                setError(
                    err.response?.data?.detail ||
                    "Failed to load this note."
                );

            } finally {

                setLoading(false);

            }

        };

        loadNote();

    }, [id]);


    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!title.trim()) {

            alert(
                "Please enter a note title."
            );

            return;

        }

        if (!department) {

            alert(
                "Please select a department."
            );

            return;

        }

        try {

            setSaving(true);

            const formData =
                new FormData();

            formData.append(
                "title",
                title.trim()
            );

            formData.append(
                "department",
                department
            );

            formData.append(
                "description",
                description.trim()
            );

            if (file) {

                formData.append(
                    "file",
                    file
                );

            }

            await API.put(
                `notes/update/${id}/`,
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                }
            );

            alert(
                "Note updated successfully."
            );

            navigate(`/note/${id}`);

        } catch (err) {

            console.error(
                "Update Note Error:",
                err
            );

            if (
                err.response?.status === 401
            ) {

                alert(
                    "Please login first."
                );

                navigate("/login");

            } else if (
                err.response?.status === 403
            ) {

                alert(
                    "You do not have permission to edit this note."
                );

            } else {

                alert(
                    err.response?.data?.detail ||
                    err.response?.data?.error ||
                    JSON.stringify(
                        err.response?.data ||
                        "Failed to update note."
                    )
                );

            }

        } finally {

            setSaving(false);

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

                        Please wait while we load the note.

                    </p>

                </div>

            </div>

        );

    }


    if (error) {

        return (

            <div className="min-h-[70vh] flex items-center justify-center px-6">

                <div className="max-w-lg w-full bg-white border border-slate-100 rounded-[30px] shadow-xl p-10 text-center">

                    <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">

                        <FileText size={28} />

                    </div>

                    <h2 className="text-2xl font-black text-slate-800 mt-5">

                        Unable to Edit Note

                    </h2>

                    <p className="text-slate-500 mt-3 leading-7">

                        {error}

                    </p>

                    <button
                        onClick={() =>
                            navigate(
                                `/note/${id}`
                            )
                        }
                        className="mt-7 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition"
                    >

                        <ArrowLeft size={18} />

                        Back to Note

                    </button>

                </div>

            </div>

        );

    }


    return (

        <section className="max-w-5xl mx-auto px-6 py-10">

            <div className="bg-white border border-slate-100 rounded-[32px] shadow-2xl overflow-hidden">

                {/* Header */}

                <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-blue-600 px-8 md:px-10 py-10 md:py-12 text-white">

                    <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white/10 blur-3xl"></div>

                    <div className="relative">

                        <button
                            onClick={() =>
                                navigate(
                                    `/note/${id}`
                                )
                            }
                            className="inline-flex items-center gap-2 bg-white/15 border border-white/10 px-5 py-2.5 rounded-xl hover:bg-white/20 transition font-semibold"
                        >

                            <ArrowLeft size={18} />

                            Back to Note

                        </button>


                        <div className="flex items-center gap-4 mt-8">

                            <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/10 flex items-center justify-center">

                                <FileText size={28} />

                            </div>

                            <div>

                                <h1 className="text-3xl md:text-4xl font-black">

                                    Edit Note

                                </h1>

                                <p className="text-orange-100 mt-2">

                                    Update your study resource.

                                </p>

                            </div>

                        </div>

                    </div>

                </div>


                {/* Form */}

                <form
                    onSubmit={handleSubmit}
                    className="p-7 md:p-10 space-y-8"
                >

                    {/* Title */}

                    <div>

                        <label className="font-bold text-slate-700 flex items-center gap-2">

                            <FileText size={18} />

                            Note Title

                        </label>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) =>
                                setTitle(
                                    e.target.value
                                )
                            }
                            placeholder="Enter note title..."
                            className="w-full mt-3 h-14 border-2 border-slate-200 rounded-2xl px-5 text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                            required
                        />

                    </div>


                    {/* Department */}

                    <div>

                        <label className="font-bold text-slate-700">

                            Department

                        </label>

                        <select
                            value={department}
                            onChange={(e) =>
                                setDepartment(
                                    e.target.value
                                )
                            }
                            className="w-full mt-3 h-14 border-2 border-slate-200 rounded-2xl px-5 text-slate-700 outline-none bg-white cursor-pointer focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                            required
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


                    {/* Description */}

                    <div>

                        <label className="font-bold text-slate-700 flex items-center gap-2">

                            <FileText size={18} />

                            Description

                        </label>

                        <textarea
                            rows={8}
                            value={description}
                            onChange={(e) =>
                                setDescription(
                                    e.target.value
                                )
                            }
                            placeholder="Describe what this note contains..."
                            className="w-full mt-3 border-2 border-slate-200 rounded-2xl px-5 py-4 resize-none text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                        />

                    </div>


                    {/* Current File */}

                    {oldFile && (

                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">

                            <div className="flex items-center gap-3">

                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">

                                    <Eye size={18} />

                                </div>

                                <div>

                                    <p className="text-xs uppercase tracking-wider font-black text-slate-400">

                                        Current File

                                    </p>

                                    <a
                                        href={`http://127.0.0.1:8000${oldFile}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-700 font-bold text-sm mt-1 inline-block"
                                    >

                                        View Current File

                                    </a>

                                </div>

                            </div>

                        </div>

                    )}


                    {/* Replace File */}

                    <div>

                        <label className="font-bold text-slate-700 flex items-center gap-2">

                            <Upload size={18} />

                            Replace File
                            <span className="text-slate-400 font-medium">
                                (Optional)
                            </span>

                        </label>

                        <input
                            type="file"
                            onChange={(e) =>
                                setFile(
                                    e.target.files?.[0] ||
                                    null
                                )
                            }
                            className="w-full mt-3 border-2 border-dashed border-slate-300 rounded-2xl p-5 file:bg-blue-600 file:text-white file:border-0 file:px-5 file:py-2 file:rounded-xl file:mr-4 cursor-pointer"
                        />

                        {file && (

                            <p className="mt-3 text-emerald-600 font-semibold">

                                New file selected:
                                {" "}
                                {file.name}

                            </p>

                        )}

                        <p className="text-xs text-slate-400 mt-2">

                            Leave this empty to keep the existing file.

                        </p>

                    </div>


                    {/* Submit */}

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white py-4 rounded-2xl text-lg font-black transition flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >

                        {saving ? (

                            <>
                                <Loader2
                                    size={20}
                                    className="animate-spin"
                                />

                                Saving Changes...

                            </>

                        ) : (

                            <>
                                <Save size={20} />

                                Save Changes

                            </>

                        )}

                    </button>

                </form>

            </div>

        </section>

    );
}

export default EditNote;