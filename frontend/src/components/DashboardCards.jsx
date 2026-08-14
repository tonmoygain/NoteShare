import {
    FileText,
    Eye,
    Download,
    Star,
    TrendingUp,
} from "lucide-react";

function DashboardCards({ stats = {} }) {
    const cards = [
        {
            title: "Total Notes",
            value: Number(stats?.total_notes) || 0,
            subtitle: "Study resources available",
            icon: <FileText size={24} />,
            iconStyle: "from-blue-500 to-cyan-400",
            bgStyle: "bg-blue-50",
            textStyle: "text-blue-600",
            shadow: "hover:shadow-blue-100",
        },
        {
            title: "Total Views",
            value: Number(stats?.total_views) || 0,
            subtitle: "Resource views",
            icon: <Eye size={24} />,
            iconStyle: "from-violet-500 to-purple-500",
            bgStyle: "bg-violet-50",
            textStyle: "text-violet-600",
            shadow: "hover:shadow-violet-100",
        },
        {
            title: "Downloads",
            value: Number(stats?.total_downloads) || 0,
            subtitle: "Notes downloaded",
            icon: <Download size={24} />,
            iconStyle: "from-emerald-500 to-teal-400",
            bgStyle: "bg-emerald-50",
            textStyle: "text-emerald-600",
            shadow: "hover:shadow-emerald-100",
        },
        {
            title: "Featured Notes",
            value: Number(stats?.featured_notes) || 0,
            subtitle: "Highlighted resources",
            icon: <Star size={24} />,
            iconStyle: "from-orange-500 to-amber-400",
            bgStyle: "bg-orange-50",
            textStyle: "text-orange-600",
            shadow: "hover:shadow-orange-100",
        },
    ];

    return (
        <section className="max-w-7xl mx-auto px-8 mt-12 mb-4">

            {/* Dashboard Header */}
            <div className="flex items-center gap-3 mb-7">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg">
                    <TrendingUp size={21} />
                </div>

                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        Platform Overview
                    </p>

                    <h2 className="text-2xl md:text-3xl font-black text-slate-800">
                        Your Academic Dashboard
                    </h2>
                </div>
            </div>

            {/* Dashboard Cards */}
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">

                {cards.map((card) => (
                    <div
                        key={card.title}
                        className={`
                            group relative
                            bg-white
                            rounded-[26px]
                            border border-slate-100
                            p-6
                            overflow-hidden
                            shadow-[0_8px_30px_rgba(15,23,42,0.06)]
                            ${card.shadow}
                            hover:-translate-y-1.5
                            hover:shadow-xl
                            transition-all
                            duration-300
                        `}
                    >

                        {/* Decorative Glow */}
                        <div
                            className={`
                                absolute
                                -right-10
                                -top-10
                                w-28
                                h-28
                                ${card.bgStyle}
                                rounded-full
                                blur-2xl
                                opacity-70
                                group-hover:scale-125
                                transition-transform
                                duration-500
                            `}
                        />

                        <div className="relative">

                            {/* Icon + Status */}
                            <div className="flex items-center justify-between">

                                <div
                                    className={`
                                        w-13
                                        h-13
                                        rounded-2xl
                                        bg-gradient-to-br
                                        ${card.iconStyle}
                                        text-white
                                        flex
                                        items-center
                                        justify-center
                                        shadow-md
                                        group-hover:scale-105
                                        transition-transform
                                        duration-300
                                    `}
                                >
                                    {card.icon}
                                </div>

                                <span
                                    className={`
                                        ${card.bgStyle}
                                        ${card.textStyle}
                                        px-3
                                        py-1.5
                                        rounded-full
                                        text-[11px]
                                        font-bold
                                    `}
                                >
                                    Live
                                </span>

                            </div>

                            {/* Number */}
                            <div className="mt-6">

                                <p className="text-sm font-semibold text-slate-500">
                                    {card.title}
                                </p>

                                <h3 className="text-4xl font-black text-slate-800 mt-1 tracking-tight">
                                    {card.value.toLocaleString()}
                                </h3>

                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">

                                <p className="text-xs text-slate-400">
                                    {card.subtitle}
                                </p>

                                <span
                                    className={`
                                        ${card.textStyle}
                                        font-bold
                                        text-lg
                                        group-hover:translate-x-1
                                        transition-transform
                                    `}
                                >
                                    →
                                </span>

                            </div>

                        </div>
                    </div>
                ))}

            </div>
        </section>
    );
}

export default DashboardCards;