import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

import {
    Upload,
    BookOpen,
    MessageSquare,
    ArrowUpRight,
    Sparkles,
    FileText,
} from "lucide-react";

function QuickActions() {
    const navigate = useNavigate();

    const actions = [
        {
            number: "01",
            title: "Upload Note",
            description:
                "Share lecture notes, assignments and useful study materials with other students.",
            icon: Upload,
            path: "/upload",
            iconStyle: "from-blue-600 to-cyan-500",
            softBg: "bg-blue-50",
            textStyle: "text-blue-600",
            borderHover:
                "hover:border-blue-200",
            glow: "bg-blue-400/10",
        },
        {
            number: "02",
            title: "Browse Notes",
            description:
                "Find organized study resources and lecture notes shared across departments.",
            icon: FileText,
            path: "/notes",
            iconStyle: "from-violet-600 to-purple-500",
            softBg: "bg-violet-50",
            textStyle: "text-violet-600",
            borderHover:
                "hover:border-violet-200",
            glow: "bg-violet-400/10",
        },
        {
            number: "03",
            title: "Read Blogs",
            description:
                "Explore tutorials, experiences, academic articles and useful learning tips.",
            icon: BookOpen,
            path: "/blogs",
            iconStyle: "from-emerald-600 to-teal-500",
            softBg: "bg-emerald-50",
            textStyle: "text-emerald-600",
            borderHover:
                "hover:border-emerald-200",
            glow: "bg-emerald-400/10",
        },
        {
            number: "04",
            title: "Discussion Room",
            description:
                "Connect with classmates and discuss academic topics, questions and ideas.",
            icon: MessageSquare,
            path: "/rooms",
            iconStyle: "from-orange-500 to-amber-400",
            softBg: "bg-orange-50",
            textStyle: "text-orange-600",
            borderHover:
                "hover:border-orange-200",
            glow: "bg-orange-400/10",
        },
    ];

    return (
        <section className="w-full">

            {/* =====================================================
                SECTION HEADER
            ====================================================== */}

            <motion.div
                initial={{
                    opacity: 0,
                    y: 16,
                }}
                whileInView={{
                    opacity: 1,
                    y: 0,
                }}
                viewport={{
                    once: true,
                    amount: 0.2,
                }}
                transition={{
                    duration: 0.45,
                    ease: "easeOut",
                }}
                className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
            >
                <div className="flex items-center gap-4">

                    <div className="relative">
                        <motion.div
                            whileHover={{
                                rotate: -3,
                                scale: 1.04,
                            }}
                            className="
                                flex
                                h-12
                                w-12
                                items-center
                                justify-center
                                rounded-2xl
                                bg-gradient-to-br
                                from-blue-600
                                to-cyan-500
                                text-white
                                shadow-lg
                                shadow-blue-500/15
                            "
                        >
                            <Sparkles size={21} />
                        </motion.div>

                        <span className="
                            absolute
                            -right-1
                            -top-1
                            h-3
                            w-3
                            rounded-full
                            border-2
                            border-[#e8edf4]
                            bg-emerald-400
                        " />
                    </div>

                    <div>
                        <p className="
                            text-[10px]
                            font-black
                            uppercase
                            tracking-[0.18em]
                            text-blue-600
                        ">
                            Get Started
                        </p>

                        <h2 className="
                            mt-1
                            text-2xl
                            font-black
                            tracking-tight
                            text-slate-800
                            sm:text-3xl
                        ">
                            Quick Actions
                        </h2>
                    </div>
                </div>

                <p className="
                    max-w-sm
                    text-sm
                    leading-6
                    text-slate-400
                    sm:text-right
                ">
                    Everything you need to explore and contribute to NoteShare.
                </p>
            </motion.div>

            {/* =====================================================
                ACTION CARDS
            ====================================================== */}

            <div className="grid gap-5 sm:grid-cols-2">

                {actions.map((action, index) => {
                    const Icon = action.icon;

                    return (
                        <motion.button
                            key={action.title}
                            type="button"
                            initial={{
                                opacity: 0,
                                y: 20,
                            }}
                            whileInView={{
                                opacity: 1,
                                y: 0,
                            }}
                            viewport={{
                                once: true,
                                amount: 0.15,
                            }}
                            transition={{
                                duration: 0.45,
                                delay:
                                    index * 0.07,
                                ease: "easeOut",
                            }}
                            whileHover={{
                                y: -6,
                            }}
                            whileTap={{
                                scale: 0.99,
                            }}
                            onClick={() =>
                                navigate(
                                    action.path
                                )
                            }
                            className={`
                                group
                                relative
                                w-full
                                overflow-hidden
                                rounded-[28px]
                                border
                                border-slate-200/80
                                bg-white
                                p-6
                                text-left
                                shadow-[0_10px_30px_rgba(15,23,42,0.045)]
                                transition-shadow
                                duration-300
                                hover:shadow-[0_25px_55px_rgba(15,23,42,0.09)]
                                ${action.borderHover}
                                focus:outline-none
                                focus:ring-4
                                focus:ring-blue-100
                            `}
                        >

                            {/* Ambient glow */}

                            <div
                                className={`
                                    pointer-events-none
                                    absolute
                                    -right-12
                                    -top-12
                                    h-36
                                    w-36
                                    rounded-full
                                    ${action.glow}
                                    blur-3xl
                                    transition-transform
                                    duration-700
                                    group-hover:scale-150
                                `}
                            />

                            {/* Top gradient line */}

                            <div
                                className={`
                                    absolute
                                    left-6
                                    right-6
                                    top-0
                                    h-1
                                    rounded-b-full
                                    bg-gradient-to-r
                                    ${action.iconStyle}
                                    opacity-60
                                `}
                            />

                            <div className="relative">

                                {/* Top row */}

                                <div className="flex items-start justify-between gap-4">

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
                                        className={`
                                            flex
                                            h-14
                                            w-14
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-2xl
                                            bg-gradient-to-br
                                            ${action.iconStyle}
                                            text-white
                                            shadow-lg
                                        `}
                                    >
                                        <Icon size={24} />
                                    </motion.div>

                                    <div className="flex items-center gap-3">

                                        <span className={`
                                            text-[10px]
                                            font-black
                                            uppercase
                                            tracking-[0.16em]
                                            ${action.textStyle}
                                        `}>
                                            {action.number}
                                        </span>

                                        <motion.div
                                            whileHover={{
                                                rotate: 5,
                                            }}
                                            className={`
                                                flex
                                                h-10
                                                w-10
                                                items-center
                                                justify-center
                                                rounded-xl
                                                ${action.softBg}
                                                ${action.textStyle}
                                            `}
                                        >
                                            <ArrowUpRight
                                                size={18}
                                            />
                                        </motion.div>
                                    </div>

                                </div>

                                {/* Content */}

                                <div className="mt-6">
                                    <h3 className="
                                        text-xl
                                        font-black
                                        tracking-tight
                                        text-slate-800
                                        transition-colors
                                        duration-300
                                        group-hover:text-blue-600
                                    ">
                                        {action.title}
                                    </h3>

                                    <p className="
                                        mt-3
                                        text-sm
                                        leading-7
                                        text-slate-500
                                    ">
                                        {action.description}
                                    </p>
                                </div>

                                {/* Bottom CTA */}

                                <div className="
                                    mt-6
                                    flex
                                    items-center
                                    justify-between
                                    border-t
                                    border-slate-100
                                    pt-5
                                ">
                                    <span
                                        className={`
                                            text-[10px]
                                            font-black
                                            uppercase
                                            tracking-[0.16em]
                                            ${action.textStyle}
                                        `}
                                    >
                                        Explore
                                    </span>

                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 transition-colors group-hover:text-slate-600">
                                        Open

                                        <motion.span
                                            className="inline-flex"
                                            whileHover={{
                                                x: 3,
                                            }}
                                        >
                                            <ArrowUpRight
                                                size={14}
                                            />
                                        </motion.span>
                                    </div>
                                </div>

                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </section>
    );
}

export default QuickActions;