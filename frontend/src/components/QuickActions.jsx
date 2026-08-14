import { useNavigate } from "react-router-dom";

import {
    Upload,
    BookOpen,
    MessageSquare,
    ArrowRight,
    Sparkles,
    FileText,
} from "lucide-react";

function QuickActions() {
    const navigate = useNavigate();

    const actions = [
        {
            title: "Upload Note",
            description:
                "Share lecture notes, assignments and useful study materials with other students.",
            icon: <Upload size={25} />,
            path: "/upload",
            iconStyle: "from-blue-600 to-cyan-500",
            bgStyle: "bg-blue-50",
            textStyle: "text-blue-600",
            borderStyle: "hover:border-blue-200",
        },

        {
            title: "Browse Notes",
            description:
                "Find organized study resources and lecture notes shared across departments.",
            icon: <FileText size={25} />,
            path: "/notes",
            iconStyle: "from-violet-600 to-purple-500",
            bgStyle: "bg-violet-50",
            textStyle: "text-violet-600",
            borderStyle: "hover:border-violet-200",
        },

        {
            title: "Read Blogs",
            description:
                "Explore tutorials, experiences, academic articles and useful learning tips.",
            icon: <BookOpen size={25} />,
            path: "/blogs",
            iconStyle: "from-emerald-600 to-teal-500",
            bgStyle: "bg-emerald-50",
            textStyle: "text-emerald-600",
            borderStyle: "hover:border-emerald-200",
        },

        {
            title: "Discussion Room",
            description:
                "Connect with classmates and discuss academic topics, questions and ideas.",
            icon: <MessageSquare size={25} />,
            path: "/rooms",
            iconStyle: "from-orange-500 to-amber-400",
            bgStyle: "bg-orange-50",
            textStyle: "text-orange-600",
            borderStyle: "hover:border-orange-200",
        },
    ];

    return (
        <section className="w-full">

            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">

                <div className="flex items-center gap-4">

                    <div className="relative">

                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                            <Sparkles size={21} />
                        </div>

                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white"></div>

                    </div>

                    <div>

                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                            Get Started
                        </p>

                        <h2 className="text-2xl md:text-3xl font-black text-slate-800 mt-1">
                            Quick Actions
                        </h2>

                    </div>

                </div>

                <p className="text-sm text-slate-400 max-w-sm sm:text-right">
                    Everything you need to explore and contribute to NoteShare.
                </p>

            </div>


            {/* Action Cards */}
            <div className="grid sm:grid-cols-2 gap-5">

                {actions.map((action) => (

                    <button
                        key={action.title}
                        onClick={() => navigate(action.path)}
                        className={`
                            group
                            relative
                            w-full
                            text-left
                            bg-white
                            border
                            border-slate-100
                            ${action.borderStyle}
                            rounded-[28px]
                            p-6
                            shadow-[0_10px_35px_rgba(15,23,42,0.06)]
                            hover:shadow-[0_20px_45px_rgba(15,23,42,0.10)]
                            hover:-translate-y-1.5
                            transition-all
                            duration-400
                            overflow-hidden
                            focus:outline-none
                            focus:ring-2
                            focus:ring-blue-500
                            focus:ring-offset-2
                        `}
                    >

                        {/* Decorative Glow */}
                        <div
                            className={`
                                absolute
                                -right-14
                                -top-14
                                w-36
                                h-36
                                ${action.bgStyle}
                                rounded-full
                                blur-3xl
                                opacity-70
                                group-hover:opacity-100
                                group-hover:scale-125
                                transition-all
                                duration-700
                            `}
                        ></div>


                        {/* Small Decorative Line */}
                        <div
                            className={`
                                absolute
                                left-0
                                top-0
                                h-1
                                w-0
                                bg-gradient-to-r
                                ${action.iconStyle}
                                group-hover:w-full
                                transition-all
                                duration-500
                            `}
                        ></div>


                        <div className="relative">

                            {/* Top */}
                            <div className="flex items-start justify-between">

                                <div
                                    className={`
                                        w-14
                                        h-14
                                        rounded-2xl
                                        bg-gradient-to-br
                                        ${action.iconStyle}
                                        text-white
                                        flex
                                        items-center
                                        justify-center
                                        shadow-lg
                                        group-hover:scale-110
                                        group-hover:rotate-2
                                        transition-all
                                        duration-500
                                    `}
                                >
                                    {action.icon}
                                </div>


                                <div
                                    className={`
                                        w-10
                                        h-10
                                        rounded-xl
                                        ${action.bgStyle}
                                        ${action.textStyle}
                                        flex
                                        items-center
                                        justify-center
                                        group-hover:translate-x-1
                                        group-hover:scale-105
                                        transition-all
                                        duration-300
                                    `}
                                >
                                    <ArrowRight size={19} />
                                </div>

                            </div>


                            {/* Content */}
                            <div className="mt-6">

                                <div className="flex items-center gap-2">

                                    <h3 className="text-xl font-black text-slate-800 group-hover:text-blue-600 transition-colors duration-300">
                                        {action.title}
                                    </h3>

                                </div>

                                <p className="text-sm text-slate-500 mt-3 leading-7">
                                    {action.description}
                                </p>

                            </div>


                            {/* Bottom */}
                            <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100">

                                <span
                                    className={`
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-wider
                                        ${action.textStyle}
                                    `}
                                >
                                    Explore
                                </span>

                                <span className="text-xs text-slate-400 group-hover:text-slate-600 transition-colors">
                                    Click to continue
                                </span>

                            </div>

                        </div>

                    </button>

                ))}

            </div>

        </section>
    );
}

export default QuickActions;