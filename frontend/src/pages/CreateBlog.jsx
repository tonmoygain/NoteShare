import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FileText,
    Image,
    Send,
    ArrowLeft,
    Sparkles,
} from "lucide-react";

import API from "../services/api";

function CreateBlog() {

    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!title.trim()) {
            alert("Please enter blog title");
            return;
        }

        if (!content.trim()) {
            alert("Please enter blog content");
            return;
        }

        setUploading(true);

        const formData = new FormData();

        formData.append("title", title);
        formData.append("content", content);

        if (image) {
            formData.append("image", image);
        }

        formData.append(
            "username",
            localStorage.getItem("username")
        );

        try {

            await API.post(
                "blogs/create/",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            alert("Blog Published Successfully!");

            navigate("/blogs");

        } catch (err) {

            console.log(err);

            alert("Failed to publish blog");

        } finally {

            setUploading(false);

        }

    };

    return (

        <section className="max-w-5xl mx-auto px-6 py-10">

            <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-100">

                {/* Header */}

                <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 px-10 py-12 text-white">

                    <button
                        onClick={() => navigate("/blogs")}
                        className="flex items-center gap-2 mb-8 bg-white/15 px-5 py-2 rounded-xl hover:bg-white/20 transition"
                    >
                        <ArrowLeft size={18} />
                        Back to Blogs
                    </button>

                    <div className="flex items-center gap-4">

                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex justify-center items-center">

                            <Sparkles size={34} />

                        </div>

                        <div>

                            <h1 className="text-4xl font-black">

                                Create New Blog

                            </h1>

                            <p className="text-blue-100 mt-2">

                                Share knowledge with every student.

                            </p>

                        </div>

                    </div>

                </div>

                {/* Form */}

                <form
                    onSubmit={handleSubmit}
                    className="p-10 space-y-8"
                >

                    <div>

                        <label className="font-bold text-slate-700 flex items-center gap-2">

                            <FileText size={18} />

                            Blog Title

                        </label>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter your blog title..."
                            className="w-full mt-3 border-2 border-slate-200 rounded-2xl px-5 py-4 focus:border-blue-600 outline-none transition"
                        />

                    </div>

                    <div>

                        <label className="font-bold text-slate-700 flex items-center gap-2">

                            <FileText size={18} />

                            Blog Content

                        </label>

                        <textarea
                            rows="12"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your blog here..."
                            className="w-full mt-3 border-2 border-slate-200 rounded-2xl px-5 py-4 resize-none focus:border-blue-600 outline-none transition"
                        />

                    </div>

                    <div>

                        <label className="font-bold text-slate-700 flex items-center gap-2">

                            <Image size={18} />

                            Cover Image (Optional)

                        </label>

                        <input
                            type="file"
                            onChange={(e) => setImage(e.target.files[0])}
                            className="w-full mt-3 border-2 border-dashed border-slate-300 rounded-2xl p-5 file:bg-blue-600 file:text-white file:border-0 file:px-5 file:py-2 file:rounded-xl file:mr-4 cursor-pointer"
                        />

                        {image && (

                            <p className="mt-3 text-green-600 font-medium">

                                Selected: {image.name}

                            </p>

                        )}

                    </div>

                    <button
                        type="submit"
                        disabled={uploading}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white py-4 rounded-2xl text-xl font-bold transition-all duration-300 flex justify-center items-center gap-3 shadow-xl"
                    >

                        <Send size={20} />

                        {uploading ? "Publishing Blog..." : "Publish Blog"}

                    </button>

                </form>

            </div>

        </section>

    );

}

export default CreateBlog;