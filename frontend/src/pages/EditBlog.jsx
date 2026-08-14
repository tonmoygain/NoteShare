import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    FileText,
    Image,
    Send,
    ArrowLeft,
    Pencil,
    Loader2,
} from "lucide-react";

import API from "../services/api";

function EditBlog() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const [error, setError] = useState("");

    useEffect(() => {

        const loadBlog = async () => {

            try {

                setLoading(true);
                setError("");

                const response = await API.get(
                    `blogs/${id}/`
                );

                setTitle(
                    response.data.title || ""
                );

                setContent(
                    response.data.content || ""
                );

            } catch (err) {

                console.error(
                    "Edit Blog Load Error:",
                    err
                );

                setError(
                    err.response?.data?.detail ||
                    "Failed to load blog."
                );

            } finally {

                setLoading(false);

            }

        };

        loadBlog();

    }, [id]);


    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!title.trim()) {

            alert("Please enter blog title.");
            return;

        }

        if (!content.trim()) {

            alert("Please enter blog content.");
            return;

        }

        try {

            setUpdating(true);

            const formData = new FormData();

            formData.append(
                "title",
                title.trim()
            );

            formData.append(
                "content",
                content.trim()
            );

            if (image) {

                formData.append(
                    "image",
                    image
                );

            }

            await API.patch(
                `blogs/update/${id}/`,
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                }
            );

            alert(
                "Blog updated successfully."
            );

            navigate(`/blog/${id}`);

        } catch (err) {

            console.error(
                "Update Blog Error:",
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
                    "You do not have permission to edit this blog."
                );

            } else {

                alert(
                    err.response?.data?.detail ||
                    err.response?.data?.error ||
                    "Failed to update blog."
                );

            }

        } finally {

            setUpdating(false);

        }

    };


    if (loading) {

        return (

            <div className="min-h-[70vh] flex items-center justify-center px-6">

                <div className="text-center">

                    <Loader2
                        size={40}
                        className="animate-spin mx-auto text-blue-600"
                    />

                    <p className="mt-5 text-slate-500 font-semibold">

                        Loading Blog...

                    </p>

                </div>

            </div>

        );

    }


    if (error) {

        return (

            <div className="min-h-[70vh] flex items-center justify-center px-6">

                <div className="max-w-lg w-full bg-white border border-slate-100 rounded-[30px] shadow-xl p-10 text-center">

                    <h2 className="text-2xl font-black text-slate-800">

                        Unable to Edit Blog

                    </h2>

                    <p className="text-slate-500 mt-3 leading-6">

                        {error}

                    </p>

                    <button
                        onClick={() =>
                            navigate("/blogs")
                        }
                        className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition"
                    >

                        <ArrowLeft size={18} />

                        Back to Blogs

                    </button>

                </div>

            </div>

        );

    }


    return (

        <section className="max-w-5xl mx-auto px-6 py-10">

            <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-100">

                {/* Header */}

                <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-blue-600 px-10 py-12 text-white">

                    <button
                        onClick={() =>
                            navigate(
                                `/blog/${id}`
                            )
                        }
                        className="flex items-center gap-2 mb-8 bg-white/15 px-5 py-2 rounded-xl hover:bg-white/20 transition"
                    >

                        <ArrowLeft size={18} />

                        Back to Blog

                    </button>


                    <div className="flex items-center gap-4">

                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex justify-center items-center">

                            <Pencil size={32} />

                        </div>


                        <div>

                            <h1 className="text-4xl font-black">

                                Edit Blog

                            </h1>

                            <p className="text-orange-100 mt-2">

                                Update your article and keep it fresh.

                            </p>

                        </div>

                    </div>

                </div>


                {/* Form */}

                <form
                    onSubmit={handleSubmit}
                    className="p-10 space-y-8"
                >

                    {/* Title */}

                    <div>

                        <label className="font-bold text-slate-700 flex items-center gap-2">

                            <FileText size={18} />

                            Blog Title

                        </label>


                        <input
                            type="text"
                            value={title}
                            onChange={(e) =>
                                setTitle(
                                    e.target.value
                                )
                            }
                            placeholder="Enter your blog title..."
                            className="w-full mt-3 border-2 border-slate-200 rounded-2xl px-5 py-4 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition"
                        />

                    </div>


                    {/* Content */}

                    <div>

                        <label className="font-bold text-slate-700 flex items-center gap-2">

                            <FileText size={18} />

                            Blog Content

                        </label>


                        <textarea
                            rows="14"
                            value={content}
                            onChange={(e) =>
                                setContent(
                                    e.target.value
                                )
                            }
                            placeholder="Write your blog here..."
                            className="w-full mt-3 border-2 border-slate-200 rounded-2xl px-5 py-4 resize-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition"
                        />

                    </div>


                    {/* Image */}

                    <div>

                        <label className="font-bold text-slate-700 flex items-center gap-2">

                            <Image size={18} />

                            Replace Cover Image
                            (Optional)

                        </label>


                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setImage(
                                    e.target.files?.[0] ||
                                    null
                                )
                            }
                            className="w-full mt-3 border-2 border-dashed border-slate-300 rounded-2xl p-5 file:bg-blue-600 file:text-white file:border-0 file:px-5 file:py-2 file:rounded-xl file:mr-4 cursor-pointer"
                        />


                        {image && (

                            <p className="mt-3 text-emerald-600 font-medium">

                                New image:
                                {" "}
                                {image.name}

                            </p>

                        )}

                        <p className="text-xs text-slate-400 mt-2">

                            Leave this empty to keep the current cover image.

                        </p>

                    </div>


                    {/* Submit */}

                    <button
                        type="submit"
                        disabled={updating}
                        className="w-full bg-gradient-to-r from-amber-500 to-blue-600 hover:from-amber-600 hover:to-blue-700 text-white py-4 rounded-2xl text-xl font-bold transition-all duration-300 flex justify-center items-center gap-3 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >

                        {updating ? (

                            <>
                                <Loader2
                                    size={20}
                                    className="animate-spin"
                                />

                                Updating Blog...

                            </>

                        ) : (

                            <>
                                <Send size={20} />

                                Update Blog

                            </>

                        )}

                    </button>

                </form>

            </div>

        </section>

    );

}

export default EditBlog;