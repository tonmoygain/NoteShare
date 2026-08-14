import { useNavigate } from "react-router-dom";

import {
    Eye,
    Download,
    ArrowUpRight,
    FileText,
    Sparkles,
    CalendarDays,
} from "lucide-react";

function NoteCard({ note }) {

    const navigate = useNavigate();

    const title =
        note?.title || "Untitled Note";

    const description =
        note?.description ||
        "No description provided.";

    const department =
        note?.department || "General";

    const uploader =
        note?.uploader_name || "Student";

    const uploadedDate = note?.uploaded_at
        ? new Date(
              note.uploaded_at
          ).toLocaleDateString()
        : "";


    return (

        <article
            onClick={() =>
                navigate(`/note/${note.id}`)
            }
            className="
                group
                relative
                bg-white
                rounded-[30px]
                border border-slate-200/70
                shadow-[0_10px_35px_rgba(15,23,42,0.06)]
                overflow-hidden
                cursor-pointer
                hover:-translate-y-2
                hover:shadow-[0_25px_60px_rgba(15,23,42,0.13)]
                hover:border-blue-200
                transition-all
                duration-500
            "
        >

            {/* Top Gradient */}

            <div
                className="
                    h-1.5
                    bg-gradient-to-r
                    from-blue-600
                    via-cyan-500
                    to-emerald-400
                "
            ></div>


            {/* Background Glow */}

            <div
                className="
                    absolute
                    -right-16
                    -top-16
                    w-40
                    h-40
                    bg-blue-50
                    rounded-full
                    blur-3xl
                    opacity-0
                    group-hover:opacity-100
                    transition-opacity
                    duration-500
                "
            ></div>


            <div className="relative p-7">

                {/* Header */}

                <div className="flex items-start justify-between gap-5">

                    <div className="flex items-center gap-4 min-w-0">

                        {/* File Icon */}

                        <div
                            className="
                                w-16
                                h-16
                                shrink-0
                                rounded-[20px]
                                bg-gradient-to-br
                                from-blue-600
                                via-blue-500
                                to-cyan-500
                                text-white
                                flex
                                items-center
                                justify-center
                                shadow-lg
                                shadow-blue-200/60
                                group-hover:scale-110
                                group-hover:rotate-2
                                transition-all
                                duration-500
                            "
                        >

                            <FileText size={28} />

                        </div>


                        {/* Title */}

                        <div className="min-w-0">

                            <div className="flex items-center gap-2 mb-2">

                                <span
                                    className="
                                        inline-flex
                                        items-center
                                        gap-1.5
                                        text-[11px]
                                        font-bold
                                        uppercase
                                        tracking-wider
                                        text-blue-600
                                    "
                                >

                                    <Sparkles size={12} />

                                    Study Note

                                </span>

                            </div>


                            <h3
                                className="
                                    text-xl
                                    font-black
                                    text-slate-800
                                    line-clamp-2
                                    leading-tight
                                    group-hover:text-blue-600
                                    transition-colors
                                    duration-300
                                "
                            >

                                {title}

                            </h3>


                            <span
                                className="
                                    inline-flex
                                    mt-3
                                    bg-blue-50
                                    text-blue-700
                                    border
                                    border-blue-100
                                    px-3
                                    py-1
                                    rounded-lg
                                    text-xs
                                    font-bold
                                "
                            >

                                {department}

                            </span>

                        </div>

                    </div>


                    {/* Open Icon */}

                    <div
                        className="
                            w-11
                            h-11
                            shrink-0
                            rounded-2xl
                            bg-slate-50
                            border border-slate-100
                            text-slate-400
                            flex
                            items-center
                            justify-center
                            group-hover:bg-blue-600
                            group-hover:text-white
                            group-hover:border-blue-600
                            group-hover:shadow-lg
                            group-hover:shadow-blue-200
                            transition-all
                            duration-300
                        "
                    >

                        <ArrowUpRight
                            size={20}
                            className="
                                group-hover:translate-x-0.5
                                group-hover:-translate-y-0.5
                                transition-transform
                            "
                        />

                    </div>

                </div>


                {/* Description */}

                <p
                    className="
                        text-slate-500
                        text-sm
                        leading-7
                        mt-6
                        line-clamp-3
                    "
                >

                    {description}

                </p>


                {/* Divider */}

                <div
                    className="
                        border-t
                        border-slate-100
                        my-6
                    "
                ></div>


                {/* Footer */}

                <div
                    className="
                        flex
                        flex-col
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        gap-5
                    "
                >

                    {/* Uploader */}

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                            min-w-0
                        "
                    >

                        <div
                            className="
                                w-10
                                h-10
                                rounded-full
                                bg-gradient-to-br
                                from-slate-800
                                to-slate-500
                                text-white
                                flex
                                items-center
                                justify-center
                                text-sm
                                font-black
                                shadow-md
                                shrink-0
                            "
                        >

                            {uploader
                                .charAt(0)
                                .toUpperCase()}

                        </div>


                        <div className="min-w-0">

                            <p
                                className="
                                    text-[11px]
                                    text-slate-400
                                    font-medium
                                "
                            >

                                Uploaded by

                            </p>


                            <p
                                className="
                                    text-sm
                                    font-bold
                                    text-slate-700
                                    truncate
                                "
                            >

                                {uploader}

                            </p>

                        </div>

                    </div>


                    {/* Stats */}

                    <div
                        className="
                            flex
                            flex-wrap
                            items-center
                            gap-2
                        "
                    >

                        {/* Views */}

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                                bg-slate-50
                                border
                                border-slate-100
                                px-3
                                py-2
                                rounded-xl
                                text-xs
                                font-semibold
                                text-slate-500
                                group-hover:bg-blue-50
                                group-hover:text-blue-600
                                transition-colors
                            "
                        >

                            <Eye size={15} />

                            {note?.views || 0}

                        </div>


                        {/* Downloads */}

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                                bg-slate-50
                                border
                                border-slate-100
                                px-3
                                py-2
                                rounded-xl
                                text-xs
                                font-semibold
                                text-slate-500
                                group-hover:bg-emerald-50
                                group-hover:text-emerald-600
                                transition-colors
                            "
                        >

                            <Download size={15} />

                            {note?.downloads || 0}

                        </div>


                        {/* Upload Date */}

                        {uploadedDate && (

                            <div
                                className="
                                    hidden
                                    sm:flex
                                    items-center
                                    gap-2
                                    bg-slate-50
                                    border
                                    border-slate-100
                                    px-3
                                    py-2
                                    rounded-xl
                                    text-xs
                                    font-semibold
                                    text-slate-500
                                    group-hover:bg-violet-50
                                    group-hover:text-violet-600
                                    transition-colors
                                "
                            >

                                <CalendarDays size={15} />

                                {uploadedDate}

                            </div>

                        )}

                    </div>

                </div>

            </div>

        </article>

    );

}

export default NoteCard;