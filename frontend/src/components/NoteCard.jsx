import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

import {
    Eye,
    Download,
    ArrowUpRight,
    FileText,
    Sparkles,
    CalendarDays,
    UserRound,
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
          ).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
          })
        : "";

    const uploaderInitial =
        uploader.charAt(0).toUpperCase();

    const openNote = () => {
        navigate(`/note/${note.id}`);
    };

    return (
        <motion.article
            initial={{
                opacity: 0,
            }}
            animate={{
                opacity: 1,
            }}
            whileHover={{
                y: -5,
            }}
            onClick={openNote}
            className="
                group
                relative
                cursor-pointer
                overflow-hidden
                rounded-[30px]
                border
                border-slate-200/80
                bg-white
                shadow-[0_10px_32px_rgba(15,23,42,0.045)]
                transition-shadow
                duration-300
                hover:border-blue-200
                hover:shadow-[0_25px_60px_rgba(15,23,42,0.10)]
            "
        >
            {/* =====================================================
                TOP ACCENT
            ====================================================== */}

            <div
                className="
                    h-1.5
                    bg-gradient-to-r
                    from-blue-600
                    via-cyan-500
                    to-emerald-400
                "
            />

            {/* =====================================================
                AMBIENT GLOW
            ====================================================== */}

            <div
                className="
                    pointer-events-none
                    absolute
                    -right-16
                    -top-16
                    h-44
                    w-44
                    rounded-full
                    bg-blue-400/10
                    blur-3xl
                    opacity-0
                    transition-all
                    duration-700
                    group-hover:scale-125
                    group-hover:opacity-100
                "
            />

            <div
                className="
                    pointer-events-none
                    absolute
                    -bottom-20
                    -left-20
                    h-40
                    w-40
                    rounded-full
                    bg-cyan-400/5
                    blur-3xl
                    opacity-0
                    transition-opacity
                    duration-700
                    group-hover:opacity-100
                "
            />

            <div className="relative p-6 sm:p-7">

                {/* =================================================
                    HEADER
                ================================================== */}

                <div className="flex items-start justify-between gap-4">

                    <div className="flex min-w-0 items-start gap-4">

                        {/* File icon */}

                        <motion.div
                            whileHover={{
                                rotate: -4,
                                scale: 1.05,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 18,
                            }}
                            className="
                                flex
                                h-14
                                w-14
                                shrink-0
                                items-center
                                justify-center
                                rounded-2xl
                                bg-gradient-to-br
                                from-blue-600
                                via-blue-500
                                to-cyan-500
                                text-white
                                shadow-lg
                                shadow-blue-500/20
                            "
                        >
                            <FileText size={25} />
                        </motion.div>

                        {/* Title */}

                        <div className="min-w-0">

                            <div className="flex items-center gap-2">
                                <span className="
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    text-[10px]
                                    font-black
                                    uppercase
                                    tracking-[0.16em]
                                    text-blue-600
                                ">
                                    <Sparkles size={11} />
                                    Study Note
                                </span>
                            </div>

                            <h3 className="
                                mt-2
                                line-clamp-2
                                text-xl
                                font-black
                                leading-tight
                                tracking-tight
                                text-slate-800
                                transition-colors
                                duration-300
                                group-hover:text-blue-600
                            ">
                                {title}
                            </h3>

                            <span className="
                                mt-3
                                inline-flex
                                max-w-full
                                items-center
                                rounded-lg
                                border
                                border-blue-100
                                bg-blue-50
                                px-3
                                py-1.5
                                text-[11px]
                                font-black
                                uppercase
                                tracking-wider
                                text-blue-700
                            ">
                                {department}
                            </span>

                        </div>
                    </div>

                    {/* Open button */}

                    <motion.div
                        whileHover={{
                            scale: 1.05,
                        }}
                        className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-slate-200
                            bg-slate-50
                            text-slate-400
                            transition-all
                            duration-300
                            group-hover:border-blue-600
                            group-hover:bg-blue-600
                            group-hover:text-white
                            group-hover:shadow-lg
                            group-hover:shadow-blue-500/20
                        "
                    >
                        <ArrowUpRight
                            size={18}
                            className="
                                transition-transform
                                duration-300
                                group-hover:-translate-y-0.5
                                group-hover:translate-x-0.5
                            "
                        />
                    </motion.div>
                </div>

                {/* =================================================
                    DESCRIPTION
                ================================================== */}

                <p className="
                    mt-6
                    line-clamp-3
                    text-sm
                    leading-7
                    text-slate-500
                ">
                    {description}
                </p>

                {/* =================================================
                    DIVIDER
                ================================================== */}

                <div className="
                    my-6
                    h-px
                    bg-gradient-to-r
                    from-slate-100
                    via-slate-200
                    to-transparent
                " />

                {/* =================================================
                    FOOTER
                ================================================== */}

                <div className="
                    flex
                    flex-col
                    gap-5
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                ">

                    {/* Uploader */}

                    <div className="
                        flex
                        min-w-0
                        items-center
                        gap-3
                    ">
                        <div className="
                            relative
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-gradient-to-br
                            from-slate-800
                            to-slate-500
                            text-sm
                            font-black
                            text-white
                            shadow-md
                        ">
                            {uploaderInitial}

                            <span className="
                                absolute
                                bottom-0
                                right-0
                                h-2.5
                                w-2.5
                                rounded-full
                                border-2
                                border-white
                                bg-emerald-400
                            " />
                        </div>

                        <div className="min-w-0">
                            <p className="
                                flex
                                items-center
                                gap-1
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-wider
                                text-slate-400
                            ">
                                <UserRound size={11} />
                                Uploaded by
                            </p>

                            <p className="
                                mt-0.5
                                truncate
                                text-sm
                                font-bold
                                text-slate-700
                            ">
                                {uploader}
                            </p>
                        </div>
                    </div>

                    {/* Stats */}

                    <div className="
                        flex
                        flex-wrap
                        items-center
                        gap-2
                    ">

                        {/* Views */}

                        <div className="
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-xl
                            border
                            border-slate-100
                            bg-slate-50
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            text-slate-500
                            transition-all
                            duration-300
                            group-hover:border-blue-100
                            group-hover:bg-blue-50
                            group-hover:text-blue-600
                        ">
                            <Eye size={14} />
                            {note?.views || 0}
                        </div>

                        {/* Downloads */}

                        <div className="
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-xl
                            border
                            border-slate-100
                            bg-slate-50
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            text-slate-500
                            transition-all
                            duration-300
                            group-hover:border-emerald-100
                            group-hover:bg-emerald-50
                            group-hover:text-emerald-600
                        ">
                            <Download size={14} />
                            {note?.downloads || 0}
                        </div>

                        {/* Date */}

                        {uploadedDate && (
                            <div className="
                                hidden
                                items-center
                                gap-1.5
                                rounded-xl
                                border
                                border-slate-100
                                bg-slate-50
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-slate-500
                                transition-all
                                duration-300
                                group-hover:border-violet-100
                                group-hover:bg-violet-50
                                group-hover:text-violet-600
                                sm:inline-flex
                            ">
                                <CalendarDays size={14} />
                                {uploadedDate}
                            </div>
                        )}
                    </div>
                </div>

                {/* =================================================
                    BOTTOM HINT
                ================================================== */}

                <div className="
                    mt-5
                    flex
                    items-center
                    justify-between
                    border-t
                    border-slate-100
                    pt-4
                ">
                    <span className="
                        text-[10px]
                        font-black
                        uppercase
                        tracking-[0.16em]
                        text-slate-300
                        transition-colors
                        group-hover:text-blue-500
                    ">
                        View resource
                    </span>

                    <span className="
                        text-[11px]
                        font-semibold
                        text-slate-400
                        transition-colors
                        group-hover:text-slate-600
                    ">
                        Open note →
                    </span>
                </div>
            </div>
        </motion.article>
    );
}

export default NoteCard;