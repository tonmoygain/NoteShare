import { useNavigate } from "react-router-dom";
import {
    BookOpen,
    ArrowRight,
    CalendarDays,
    User,
    Eye,
} from "lucide-react";

function BlogCard({ blog }) {
    const navigate = useNavigate();

    const blogId = blog?.id;

    const title = blog?.title || "Untitled Blog";
    const content = blog?.content || blog?.body || "No description available.";

    const author =
        blog?.author_name ||
        blog?.author ||
        blog?.username ||
        "Student";

    const views = Number(blog?.views) || 0;

    const date = blog?.created_at
        ? new Date(blog.created_at).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
          })
        : "Recently";

    const handleOpen = () => {
        if (blogId) {
            navigate(`/blog/${blogId}`);
        }
    };

    return (
        <article
            onClick={handleOpen}
            className="
                group
                relative
                bg-white
                rounded-[28px]
                border
                border-slate-100
                overflow-hidden
                shadow-[0_10px_35px_rgba(15,23,42,0.06)]
                hover:shadow-2xl
                hover:-translate-y-1.5
                transition-all
                duration-400
                cursor-pointer
            "
        >

            {/* Top Accent */}
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

            <div className="p-7">

                {/* Top Row */}
                <div className="flex items-start justify-between gap-4">

                    <div
                        className="
                            w-14
                            h-14
                            rounded-2xl
                            bg-gradient-to-br
                            from-emerald-500
                            to-teal-500
                            text-white
                            flex
                            items-center
                            justify-center
                            shadow-lg
                            group-hover:scale-105
                            transition-transform
                            duration-300
                        "
                    >
                        <BookOpen size={25} />
                    </div>

                    <span
                        className="
                            bg-emerald-50
                            text-emerald-700
                            px-3
                            py-1.5
                            rounded-full
                            text-xs
                            font-bold
                        "
                    >
                        Academic
                    </span>

                </div>

                {/* Title */}
                <h3
                    className="
                        text-2xl
                        font-black
                        text-slate-800
                        mt-6
                        line-clamp-2
                        group-hover:text-emerald-600
                        transition-colors
                    "
                >
                    {title}
                </h3>

                {/* Description */}
                <p
                    className="
                        text-slate-500
                        mt-3
                        leading-7
                        line-clamp-3
                    "
                >
                    {content}
                </p>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-5 mt-6 text-sm text-slate-400">

                    <div className="flex items-center gap-2">
                        <User size={16} />
                        <span>{author}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <CalendarDays size={16} />
                        <span>{date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Eye size={16} />
                        <span>{views}</span>
                    </div>

                </div>

                {/* Bottom */}
                <div
                    className="
                        flex
                        items-center
                        justify-between
                        mt-7
                        pt-5
                        border-t
                        border-slate-100
                    "
                >

                    <span className="text-sm font-bold text-slate-600">
                        Read article
                    </span>

                    <div
                        className="
                            w-10
                            h-10
                            rounded-full
                            bg-emerald-50
                            text-emerald-600
                            flex
                            items-center
                            justify-center
                            group-hover:bg-emerald-600
                            group-hover:text-white
                            group-hover:translate-x-1
                            transition-all
                            duration-300
                        "
                    >
                        <ArrowRight size={19} />
                    </div>

                </div>

            </div>
        </article>
    );
}

export default BlogCard;