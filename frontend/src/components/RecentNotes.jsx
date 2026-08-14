import { useNavigate } from "react-router-dom";
import {
    BookOpen,
    Eye,
    Download,
    ArrowUpRight,
    FileText,
} from "lucide-react";

function RecentNotes({ notes = [] }) {

    const navigate = useNavigate();

    const recentNotes = notes.slice(0, 5);

    return (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_10px_40px_rgba(15,23,42,0.06)] p-7">

            {/* Header */}

            <div className="flex items-start justify-between mb-7">

                <div>

                    <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                        <BookOpen size={14} />
                        Resources
                    </span>

                    <h2 className="text-2xl font-black text-slate-800 mt-4">
                        Recent Notes
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                        Latest study materials
                    </p>

                </div>

                <button
                    onClick={() =>
                        document
                            .getElementById("notes-section")
                            ?.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                            })
                    }
                    className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                    title="View all notes"
                >
                    <ArrowUpRight size={18} />
                </button>

            </div>


            {/* Notes */}

            {recentNotes.length === 0 ? (

                <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-200 p-8 text-center">

                    <div className="w-14 h-14 mx-auto rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400">
                        <FileText size={25} />
                    </div>

                    <h3 className="font-bold text-slate-700 mt-4">
                        No Recent Notes
                    </h3>

                    <p className="text-sm text-slate-400 mt-2">
                        Uploaded notes will appear here.
                    </p>

                </div>

            ) : (

                <div className="space-y-4">

                    {recentNotes.map((note) => (

                        <div
                            key={note.id}
                            onClick={() => navigate(`/note/${note.id}`)}
                            className="group cursor-pointer rounded-2xl border border-slate-100 bg-slate-50 p-4 hover:bg-white hover:border-blue-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                        >

                            <div className="flex gap-4">

                                {/* Icon */}

                                <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                                    <FileText size={21} />
                                </div>


                                {/* Content */}

                                <div className="min-w-0 flex-1">

                                    <div className="flex items-start justify-between gap-3">

                                        <h3 className="font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition">
                                            {note.title}
                                        </h3>

                                        <ArrowUpRight
                                            size={17}
                                            className="shrink-0 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition"
                                        />

                                    </div>


                                    <div className="flex items-center gap-2 mt-2">

                                        <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg">
                                            {note.department}
                                        </span>

                                        {note.uploader_name && (
                                            <span className="text-xs text-slate-400 truncate">
                                                by {note.uploader_name}
                                            </span>
                                        )}

                                    </div>


                                    {/* Stats */}

                                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">

                                        <span className="flex items-center gap-1">
                                            <Eye size={14} />
                                            {note.views || 0}
                                        </span>

                                        <span className="flex items-center gap-1">
                                            <Download size={14} />
                                            {note.downloads || 0}
                                        </span>

                                    </div>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            )}


            {/* Bottom */}

            {recentNotes.length > 0 && (

                <button
                    onClick={() =>
                        document
                            .getElementById("notes-section")
                            ?.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                            })
                    }
                    className="w-full mt-6 py-3.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 font-semibold text-sm transition"
                >
                    View All Notes →
                </button>

            )}

        </div>
    );
}

export default RecentNotes;