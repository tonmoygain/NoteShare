import { motion } from "motion/react";

import {
    FileText,
    Eye,
    Download,
    Star,
    TrendingUp,
    ArrowUpRight,
} from "lucide-react";

function DashboardCards({ stats = {} }) {
    const cards = [
        {
            title: "Total Notes",
            value: Number(stats?.total_notes) || 0,
            subtitle: "Study resources available",
            icon: FileText,
            iconStyle: "from-blue-600 to-cyan-500",
            iconBg: "bg-blue-50",
            iconText: "text-blue-600",
            accent: "bg-blue-500",
            glow: "bg-blue-400/10",
        },
        {
            title: "Total Views",
            value: Number(stats?.total_views) || 0,
            subtitle: "Resource views",
            icon: Eye,
            iconStyle: "from-violet-600 to-purple-500",
            iconBg: "bg-violet-50",
            iconText: "text-violet-600",
            accent: "bg-violet-500",
            glow: "bg-violet-400/10",
        },
        {
            title: "Downloads",
            value: Number(stats?.total_downloads) || 0,
            subtitle: "Notes downloaded",
            icon: Download,
            iconStyle: "from-emerald-600 to-teal-500",
            iconBg: "bg-emerald-50",
            iconText: "text-emerald-600",
            accent: "bg-emerald-500",
            glow: "bg-emerald-400/10",
        },
        {
            title: "Featured Notes",
            value: Number(stats?.featured_notes) || 0,
            subtitle: "Highlighted resources",
            icon: Star,
            iconStyle: "from-orange-500 to-amber-400",
            iconBg: "bg-orange-50",
            iconText: "text-orange-600",
            accent: "bg-orange-500",
            glow: "bg-orange-400/10",
        },
    ];

    return (
        <section className="mx-auto max-w-7xl px-5 sm:px-8">

            {/* =====================================================
                SECTION HEADER
            ====================================================== */}

            <motion.div
                initial={{
                    opacity: 0,
                    y: 14,
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
                }}
                className="mb-7 flex items-end justify-between gap-4"
            >
                <div className="flex items-center gap-3">
                    <div className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-2xl
                        bg-gradient-to-br
                        from-blue-600
                        to-cyan-500
                        text-white
                        shadow-lg
                        shadow-blue-500/15
                    ">
                        <TrendingUp size={21} />
                    </div>

                    <div>
                        <p className="
                            text-[10px]
                            font-black
                            uppercase
                            tracking-[0.18em]
                            text-blue-600
                        ">
                            Platform Overview
                        </p>

                        <h2 className="
                            mt-1
                            text-2xl
                            font-black
                            tracking-tight
                            text-slate-800
                            sm:text-3xl
                        ">
                            Your Academic Dashboard
                        </h2>
                    </div>
                </div>

                <div className="
                    hidden
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-slate-200
                    bg-white/80
                    px-3
                    py-2
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-400
                    shadow-sm
                    sm:inline-flex
                ">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Updated live
                </div>
            </motion.div>

            {/* =====================================================
                CARDS
            ====================================================== */}

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

                {cards.map((card, index) => {
                    const Icon = card.icon;

                    return (
                        <motion.div
                            key={card.title}
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
                                delay: index * 0.06,
                                ease: "easeOut",
                            }}
                            whileHover={{
                                y: -5,
                            }}
                            className="
                                group
                                relative
                                overflow-hidden
                                rounded-[28px]
                                border
                                border-slate-200/80
                                bg-white
                                p-6
                                shadow-[0_10px_30px_rgba(15,23,42,0.045)]
                                transition-shadow
                                duration-300
                                hover:shadow-[0_25px_55px_rgba(15,23,42,0.09)]
                            "
                        >
                            {/* Accent line */}
                            <div
                                className={`
                                    absolute
                                    left-6
                                    right-6
                                    top-0
                                    h-1
                                    ${card.accent}
                                    rounded-b-full
                                    opacity-70
                                `}
                            />

                            {/* Ambient glow */}
                            <div
                                className={`
                                    pointer-events-none
                                    absolute
                                    -right-10
                                    -top-10
                                    h-32
                                    w-32
                                    rounded-full
                                    ${card.glow}
                                    blur-3xl
                                    transition-transform
                                    duration-700
                                    group-hover:scale-150
                                `}
                            />

                            <div className="relative">

                                {/* Top row */}

                                <div className="flex items-start justify-between gap-4">

                                    <motion.div
                                        whileHover={{
                                            rotate: -3,
                                            scale: 1.04,
                                        }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 18,
                                        }}
                                        className={`
                                            flex
                                            h-13
                                            w-13
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-2xl
                                            bg-gradient-to-br
                                            ${card.iconStyle}
                                            text-white
                                            shadow-lg
                                        `}
                                    >
                                        <Icon size={23} />
                                    </motion.div>

                                    <div
                                        className={`
                                            flex
                                            items-center
                                            gap-1.5
                                            rounded-full
                                            ${card.iconBg}
                                            px-2.5
                                            py-1.5
                                            text-[10px]
                                            font-black
                                            uppercase
                                            tracking-wider
                                            ${card.iconText}
                                        `}
                                    >
                                        <span
                                            className={`
                                                h-1.5
                                                w-1.5
                                                rounded-full
                                                ${card.accent}
                                            `}
                                        />

                                        Active
                                    </div>
                                </div>

                                {/* Value */}

                                <div className="mt-6">
                                    <p className="text-sm font-semibold text-slate-500">
                                        {card.title}
                                    </p>

                                    <motion.h3
                                        initial={{
                                            opacity: 0,
                                        }}
                                        whileInView={{
                                            opacity: 1,
                                        }}
                                        viewport={{
                                            once: true,
                                        }}
                                        transition={{
                                            duration: 0.5,
                                            delay:
                                                0.15 +
                                                index * 0.06,
                                        }}
                                        className="
                                            mt-1
                                            text-4xl
                                            font-black
                                            tracking-tight
                                            text-slate-800
                                        "
                                    >
                                        {card.value.toLocaleString()}
                                    </motion.h3>
                                </div>

                                {/* Bottom */}

                                <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">

                                    <p className="min-w-0 truncate text-xs font-medium text-slate-400">
                                        {card.subtitle}
                                    </p>

                                    <motion.span
                                        whileHover={{
                                            x: 2,
                                            y: -2,
                                        }}
                                        className={`
                                            flex
                                            h-8
                                            w-8
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-lg
                                            ${card.iconBg}
                                            ${card.iconText}
                                            transition-colors
                                        `}
                                    >
                                        <ArrowUpRight size={15} />
                                    </motion.span>

                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}

export default DashboardCards;