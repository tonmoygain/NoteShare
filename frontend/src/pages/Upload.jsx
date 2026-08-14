import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    UploadCloud,
    FileText,
    ArrowLeft,
    BookOpen,
    FolderOpen,
    Sparkles,
    X,
    CheckCircle2,
    Loader2,
} from "lucide-react";

import API from "../services/api";

function Upload() {

    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [department, setDepartment] = useState("CSE");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);

    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "image/png",
        "image/jpeg",
    ];


    const handleFileChange = (e) => {

        const selectedFile =
            e.target.files?.[0];

        if (!selectedFile) return;

        setError("");

        if (!allowedTypes.includes(selectedFile.type)) {

            setError(
                "Unsupported file type. Please choose PDF, DOC, DOCX, PPT, PPTX, PNG or JPG."
            );

            e.target.value = "";
            return;

        }

        if (
            selectedFile.size >
            10 * 1024 * 1024
        ) {

            setError(
                "Maximum file size is 10 MB."
            );

            e.target.value = "";
            return;

        }

        setFile(selectedFile);

    };


    const removeFile = () => {

        setFile(null);

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        if (uploading) return;

        setError("");

        if (!title.trim()) {

            setError(
                "Please enter a note title."
            );

            return;

        }

        if (!department) {

            setError(
                "Please select a department."
            );

            return;

        }

        if (!description.trim()) {

            setError(
                "Please enter a description."
            );

            return;

        }

        if (!file) {

            setError(
                "Please select a file to upload."
            );

            return;

        }


        const token =
            localStorage.getItem("access");

        if (!token) {

            alert(
                "Please login first to upload a note."
            );

            navigate("/login");

            return;

        }


        try {

            setUploading(true);

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

            formData.append(
                "file",
                file
            );

            formData.append(
                "username",
                localStorage.getItem("username") || ""
            );


            const response = await API.post(
                "notes/create/",
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                }
            );


            alert(
                "Note uploaded successfully!"
            );


            if (response.data?.id) {

                navigate(
                    `/note/${response.data.id}`
                );

            } else {

                navigate("/notes");

            }

        } catch (err) {

            console.error(
                "Upload Note Error:",
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
                err.response?.status === 400
            ) {

                setError(
                    err.response?.data?.detail ||
                    err.response?.data?.error ||
                    JSON.stringify(
                        err.response?.data ||
                        "Invalid upload data."
                    )
                );

            } else {

                setError(
                    err.response?.data?.detail ||
                    err.response?.data?.error ||
                    "Upload failed. Please try again."
                );

            }

        } finally {

            setUploading(false);

        }

    };


    return (

        <section className="max-w-5xl mx-auto px-6 py-10">

            <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-100">

                {/* Header */}

                <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 px-8 md:px-10 py-10 md:py-12 text-white">

                    <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white/10 blur-3xl"></div>

                    <div className="relative">

                        <button
                            type="button"
                            onClick={() => navigate("/notes")}
                            className="inline-flex items-center gap-2 bg-white/15 border border-white/10 px-5 py-2.5 rounded-xl hover:bg-white/20 transition font-semibold"
                        >

                            <ArrowLeft size={18} />

                            Back to Notes

                        </button>


                        <div className="flex items-center gap-4 mt-8">

                            <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/10 flex items-center justify-center">

                                <Sparkles size={32} />

                            </div>


                            <div>

                                <h1 className="text-3xl md:text-4xl font-black">

                                    Upload Study Note

                                </h1>

                                <p className="text-blue-100 mt-2">

                                    Share useful academic resources with other students.

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

                    {/* Error */}

                    {error && (

                        <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 rounded-2xl px-5 py-4">

                            <div className="w-6 h-6 shrink-0 rounded-full bg-red-100 flex items-center justify-center text-xs font-black">
                                !
                            </div>

                            <p className="text-sm font-semibold leading-6">
                                {error}
                            </p>

                        </div>

                    )}


                    {/* Title */}

                    <div>

                        <label className="font-bold flex items-center gap-2 text-slate-700">

                            <BookOpen size={18} />

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
                            placeholder="Operating System Mid Note"
                            disabled={uploading}
                            className="w-full mt-3 h-14 border-2 border-slate-200 rounded-2xl px-5 outline-none text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition disabled:bg-slate-50"
                        />

                    </div>


                    {/* Department */}

                    <div>

                        <label className="font-bold flex items-center gap-2 text-slate-700">

                            <FolderOpen size={18} />

                            Department

                        </label>

                        <select
                            value={department}
                            onChange={(e) =>
                                setDepartment(
                                    e.target.value
                                )
                            }
                            disabled={uploading}
                            className="w-full mt-3 h-14 border-2 border-slate-200 rounded-2xl px-5 outline-none bg-white text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition disabled:bg-slate-50"
                        >

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

                        <label className="font-bold flex items-center gap-2 text-slate-700">

                            <FileText size={18} />

                            Description

                        </label>

                        <textarea
                            rows="7"
                            value={description}
                            onChange={(e) =>
                                setDescription(
                                    e.target.value
                                )
                            }
                            placeholder="Write a short description of what this note contains..."
                            disabled={uploading}
                            className="w-full mt-3 border-2 border-slate-200 rounded-2xl px-5 py-4 resize-none outline-none text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition disabled:bg-slate-50"
                        />

                    </div>


                    {/* File Upload */}

                    <div>

                        <label className="font-bold text-slate-700">

                            Upload File

                        </label>


                        {!file ? (

                            <label className="mt-4 border-2 border-dashed border-blue-300 rounded-[28px] p-10 md:p-12 flex flex-col justify-center items-center cursor-pointer bg-blue-50/30 hover:bg-blue-50 hover:border-blue-400 transition">

                                <div className="w-20 h-20 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center">

                                    <UploadCloud
                                        size={40}
                                    />

                                </div>


                                <h2 className="mt-5 text-xl md:text-2xl font-black text-slate-800">

                                    Choose a Study File

                                </h2>


                                <p className="text-slate-500 mt-2 text-center">

                                    PDF, DOC, DOCX, PPT, PPTX, PNG or JPG

                                </p>


                                <p className="text-xs text-slate-400 mt-2">

                                    Maximum file size: 10 MB

                                </p>


                                <input
                                    hidden
                                    type="file"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
                                    onChange={
                                        handleFileChange
                                    }
                                    disabled={uploading}
                                />

                            </label>

                        ) : (

                            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-2xl p-5">

                                <div className="flex items-center justify-between gap-4">

                                    <div className="flex items-center gap-4 min-w-0">

                                        <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-600 text-white flex items-center justify-center">

                                            <FileText
                                                size={22}
                                            />

                                        </div>


                                        <div className="min-w-0">

                                            <p className="font-bold text-slate-800 truncate">

                                                {file.name}

                                            </p>

                                            <p className="text-sm text-slate-500 mt-1">

                                                {(
                                                    file.size /
                                                    1024 /
                                                    1024
                                                ).toFixed(2)}
                                                {" "}
                                                MB

                                            </p>

                                        </div>

                                    </div>


                                    <button
                                        type="button"
                                        onClick={removeFile}
                                        disabled={uploading}
                                        className="w-10 h-10 shrink-0 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition disabled:opacity-50"
                                        title="Remove selected file"
                                    >

                                        <X
                                            size={18}
                                            className="mx-auto"
                                        />

                                    </button>

                                </div>


                                <div className="mt-4 flex items-center gap-2 text-emerald-600 text-sm font-semibold">

                                    <CheckCircle2
                                        size={16}
                                    />

                                    File ready to upload

                                </div>

                            </div>

                        )}

                    </div>


                    {/* Submit */}

                    <button
                        type="submit"
                        disabled={uploading}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white py-4 rounded-2xl text-lg font-black transition flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >

                        {uploading ? (

                            <>
                                <Loader2
                                    size={20}
                                    className="animate-spin"
                                />

                                Uploading Note...

                            </>

                        ) : (

                            <>
                                <UploadCloud
                                    size={20}
                                />

                                Upload Note

                            </>

                        )}

                    </button>

                </form>

            </div>

        </section>

    );
}

export default Upload;