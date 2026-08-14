import {
    Eye,
    Download,
    ArrowRight,
    BookOpen,
    TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function TopNotes({ title, notes = [], type }) {

    const navigate = useNavigate();

    const isDownload = type === "download";

    const theme = isDownload
        ? {
              iconBg: "bg-blue-50",
              iconText: "text-blue-600",
              badgeBg: "bg-blue-50",
              badgeText: "text-blue-600",
              hoverText: "group-hover:text-blue-600",
              hoverBorder: "group-hover:border-blue-200",
              arrowHover: "group-hover:bg-blue-600",
              arrowHoverText: "group-hover:text-white",
          }
        : {
              iconBg: "bg-violet-50",
              iconText: "text-violet-600",
              badgeBg: "bg-violet-50",
              badgeText: "text-violet-600",
              hoverText: "group-hover:text-violet-600",
              hoverBorder: "group-hover:border-violet-200",
              arrowHover: "group-hover:bg-violet-600",
              arrowHoverText: "group-hover:text-white",
          };

    return (
        <section
            className="
                group/container
                bg-white
                rounded-[30px]
                border border-slate-100
                shadow-[0_10px_40px_rgba(15,23,42,0.06)]
                overflow-hidden
                hover:shadow-[0_20px_60px_rgba(15,23,42,0.10)]
                transition-all
                duration-500
            "
        >

            {/* Top Gradient Line */}

            <div
                className={`h-1.5 ${
                    isDownload
                        ? "bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400"
                        : "bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-400"
                }`}
            />


            {/* Header */}

            <div className="px-7 pt-7 pb-6">

                <div className="flex items-start justify-between gap-5">

                    <div className="flex items-center gap-4">

                        {/* Icon */}

                        <div
                            className={`
                                w-14
                                h-14
                                rounded-2xl
                                ${theme.iconBg}
                                ${theme.iconText}
                                flex
                                items-center
                                justify-center
                                shadow-sm
                            `}
                        >
                            {isDownload ? (
                                <Download size={25} />
                            ) : (
                                <Eye size={25} />
                            )}
                        </div>


                        {/* Title */}

                        <div>

                            <div className="flex items-center gap-2">

                                <TrendingUp
                                    size={15}
                                    className={theme.iconText}
                                />

                                <span
                                    className={`text-xs font-bold uppercase tracking-wider ${theme.iconText}`}
                                >
                                    Trending
                                </span>

                            </div>

                            <h2 className="text-xl md:text-2xl font-black text-slate-800 mt-1">
                                {title}
                            </h2>

                            <p className="text-sm text-slate-400 mt-1">
                                Popular resources among students
                            </p>

                        </div>

                    </div>


                    {/* Top 5 Badge */}

                    <span
                        className={`
                            hidden sm:inline-flex
                            ${theme.badgeBg}
                            ${theme.badgeText}
                            px-3.5
                            py-2
                            rounded-full
                            text-xs
                            font-bold
                            whitespace-nowrap
                        `}
                    >
                        Top 5
                    </span>

                </div>

            </div>


            {/* Notes List */}

            <div className="px-5 pb-5">

                {notes.length === 0 ? (

                    <div className="py-14 text-center">

                        <div
                            className={`
                                w-16
                                h-16
                                mx-auto
                                rounded-2xl
                                ${theme.iconBg}
                                ${theme.iconText}
                                flex
                                items-center
                                justify-center
                            `}
                        >
                            <BookOpen size={28} />
                        </div>

                        <h3 className="font-bold text-slate-700 mt-5">
                            No Notes Available
                        </h3>

                        <p className="text-sm text-slate-400 mt-2">
                            Popular resources will appear here.
                        </p>

                    </div>

                ) : (

                    <div className="space-y-3">

                        {notes.slice(0, 5).map((note, index) => (

                            <button
                                key={note.id}
                                onClick={() =>
                                    navigate(`/note/${note.id}`)
                                }
                                className="
                                    group
                                    w-full
                                    flex
                                    items-center
                                    gap-4
                                    p-4
                                    rounded-2xl
                                    border border-slate-100
                                    bg-slate-50/50
                                    hover:bg-white
                                    hover:shadow-lg
                                    transition-all
                                    duration-300
                                    text-left
                                "
                            >

                                {/* Rank */}

                                <div
                                    className={`
                                        w-10
                                        h-10
                                        shrink-0
                                        rounded-xl
                                        flex
                                        items-center
                                        justify-center
                                        font-black
                                        text-sm

                                        ${
                                            index === 0
                                                ? "bg-gradient-to-br from-yellow-400 to-orange-400 text-white shadow-md"
                                                : index === 1
                                                ? "bg-slate-200 text-slate-700"
                                                : index === 2
                                                ? "bg-orange-100 text-orange-700"
                                                : "bg-white text-slate-500 border border-slate-200"
                                        }
                                    `}
                                >
                                    {index + 1}
                                </div>


                                {/* Note Icon */}

                                <div
                                    className={`
                                        w-11
                                        h-11
                                        shrink-0
                                        rounded-xl
                                        ${theme.iconBg}
                                        ${theme.iconText}
                                        flex
                                        items-center
                                        justify-center
                                    `}
                                >
                                    <BookOpen size={19} />
                                </div>


                                {/* Content */}

                                <div className="flex-1 min-w-0">

                                    <h3
                                        className={`
                                            font-bold
                                            text-slate-800
                                            truncate
                                            transition-colors
                                            ${theme.hoverText}
                                        `}
                                    >
                                        {note.title || "Untitled Note"}
                                    </h3>

                                    <div className="flex items-center gap-2 mt-1">

                                        <span className="text-xs text-slate-400 truncate">
                                            {note.department || "Academic"}
                                        </span>

                                        <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0"></span>

                                        <span className="text-xs text-slate-400">

                                            {isDownload
                                                ? `${note.downloads || 0} downloads`
                                                : `${note.views || 0} views`}

                                        </span>

                                    </div>

                                </div>


                                {/* Arrow */}

                                <div
                                    className={`
                                        w-9
                                        h-9
                                        shrink-0
                                        rounded-xl
                                        bg-white
                                        border border-slate-200
                                        text-slate-400
                                        flex
                                        items-center
                                        justify-center
                                        transition-all
                                        ${theme.arrowHover}
                                        ${theme.arrowHoverText}
                                    `}
                                >
                                    <ArrowRight
                                        size={17}
                                        className="
                                            group-hover:translate-x-0.5
                                            transition-transform
                                        "
                                    />
                                </div>

                            </button>

                        ))}

                    </div>

                )}

            </div>


            {/* Footer */}

            {notes.length > 0 && (

                <div className="px-7 py-5 bg-slate-50/70 border-t border-slate-100">

                    <button
                        onClick={() => navigate("/notes")}
                        className={`
                            w-full
                            flex
                            items-center
                            justify-center
                            gap-2
                            text-sm
                            font-bold
                            text-slate-500
                            ${theme.hoverText}
                            transition-colors
                        `}
                    >
                        Browse all notes

                        <ArrowRight
                            size={16}
                            className="group-hover:translate-x-1 transition-transform"
                        />

                    </button>

                </div>

            )}

        </section>
    );
}

export default TopNotes;