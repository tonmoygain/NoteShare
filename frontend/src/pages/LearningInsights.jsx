import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    BarChart3,
    BrainCircuit,
    CheckCircle2,
    Clock3,
    RotateCcw,
    Sparkles,
    Target,
    TrendingUp,
    XCircle,
} from "lucide-react";
import { clearLearningEvents, getLearningEvents } from "../utils/learningAnalytics";

function LearningInsights() {
    const navigate = useNavigate();
    const [refreshKey, setRefreshKey] = useState(0);

    const events = useMemo(() => {
        void refreshKey;
        return getLearningEvents();
    }, [refreshKey]);

    const stats = useMemo(() => {
        const attempts = events.filter((item) => ["correct", "partial", "incorrect"].includes(item.evaluation));
        const correct = attempts.filter((item) => item.evaluation === "correct").length;
        const incorrect = attempts.filter((item) => item.evaluation === "incorrect").length;
        const partial = attempts.filter((item) => item.evaluation === "partial").length;
        const sessions = new Set(events.map((item) => item.sessionId).filter(Boolean)).size;
        const accuracy = attempts.length ? Math.round((correct / attempts.length) * 100) : 0;
        const noteCounts = {};
        attempts.forEach((item) => {
            const key = item.noteTitle || "Unknown note";
            noteCounts[key] = (noteCounts[key] || 0) + 1;
        });
        const topicMap = {};
        attempts.forEach((item) => {
            const topic = item.topic || "General topic";
            if (!topicMap[topic]) topicMap[topic] = { total: 0, correct: 0, partial: 0, incorrect: 0 };
            topicMap[topic].total += 1;
            topicMap[topic][item.evaluation] += 1;
        });
        const topics = Object.entries(topicMap)
            .map(([topic, value]) => ({
                topic,
                ...value,
                accuracy: Math.round((value.correct / value.total) * 100),
            }))
            .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total);
        const recent = [...events].reverse().slice(0, 8);
        return { attempts, correct, incorrect, partial, sessions, accuracy, noteCounts, topics, recent };
    }, [events]);

    const weakTopics = stats.topics.filter((item) => item.total >= 1 && item.accuracy < 60).slice(0, 3);
    const strongTopics = [...stats.topics].filter((item) => item.total >= 1).sort((a, b) => b.accuracy - a.accuracy).slice(0, 3);

    const handleClear = () => {
        clearLearningEvents();
        setRefreshKey((value) => value + 1);
    };

    return (
        <section className="learning-insights-page mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
            <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-900 px-6 py-8 text-white shadow-[0_28px_80px_rgba(15,23,42,.18)] sm:px-9 sm:py-10 lg:px-12 lg:py-12"
            >
                <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl" />
                <div className="relative grid gap-8 lg:grid-cols-[1fr_330px] lg:items-center">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[.18em] text-cyan-200 backdrop-blur-sm">
                            <BarChart3 size={14} /> NoteShare Learning Intelligence · Flagship Learning Layer
                        </span>
                        <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                            See how you learn.
                            <span className="block bg-gradient-to-r from-cyan-300 via-blue-200 to-white bg-clip-text text-transparent">Know what to study next.</span>
                        </h1>
                        <p className="mt-5 max-w-2xl text-sm leading-7 text-blue-100/80 sm:text-base">
                            NoteShare turns your AI Tutor practice into simple learning insights: accuracy, strong areas, weak areas, and a clear next step.
                        </p>
                        <div className="mt-7 flex flex-wrap items-center gap-3">
                            <button type="button" onClick={() => navigate("/ai-tutor")} className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-black text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-900">
                                Practice with AI Tutor <ArrowRight size={15} />
                            </button>
                            <button type="button" onClick={handleClear} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-black text-white backdrop-blur-sm transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-900">
                                <RotateCcw size={14} /> Reset my data
                            </button>
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-white/10 bg-white/10 p-6 backdrop-blur-md">
                        <p className="text-[10px] font-black uppercase tracking-[.16em] text-cyan-200">How this works</p>
                        <div className="mt-5 space-y-3">
                            {[
                                ["01", "Collect", "Record Tutor practice signals"],
                                ["02", "Measure", "Calculate simple learning statistics"],
                                ["03", "Spot", "Find weaker and stronger topics"],
                                ["04", "Recommend", "Suggest what to practice next"],
                            ].map(([n, title, text]) => (
                                <div key={n} className="flex gap-3 rounded-2xl border border-white/10 bg-slate-950/20 p-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-300/15 text-[10px] font-black text-cyan-200">{n}</div>
                                    <div>
                                        <p className="text-xs font-black text-white">{title}</p>
                                        <p className="mt-0.5 text-[10px] leading-4 text-blue-100/60">{text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.section>

            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    ["Practice attempts", stats.attempts.length, BrainCircuit],
                    ["Accuracy", `${stats.accuracy}%`, TrendingUp],
                    ["Correct", stats.correct, CheckCircle2],
                    ["Sessions", stats.sessions, Clock3],
                ].map(([label, value, Icon]) => (
                    <div key={label} className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_14px_45px_rgba(15,23,42,.06)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_55px_rgba(15,23,42,.09)]">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[.16em] text-slate-400">{label}</span>
                            <Icon size={17} className="text-blue-600" />
                        </div>
                        <p className="mt-3 text-3xl font-black text-slate-800">{value}</p>
                    </div>
                ))}
            </section>

            <section className="mt-8 grid gap-5 lg:grid-cols-2">
                <div className="rounded-[28px] border border-amber-200/80 bg-amber-50/70 p-6">
                    <div className="flex items-center gap-3 text-amber-700"><Target size={18} /><span className="text-[10px] font-black uppercase tracking-wider">Priority review</span></div>
                    <h2 className="mt-2 text-xl font-black text-slate-800">Topics that need more practice</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">Simple analytics flag topics where your correct-answer rate is currently below 60%.</p>
                    <div className="mt-5 space-y-3">
                        {weakTopics.length ? weakTopics.map((item) => (
                            <div key={item.topic} className="rounded-2xl border border-amber-100 bg-white p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-black text-slate-800">{item.topic}</p>
                                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[9px] font-black text-amber-700">{item.accuracy}%</span>
                                </div>
                                <p className="mt-1 text-[10px] font-semibold text-slate-400">{item.total} evaluated response{item.total === 1 ? "" : "s"}</p>
                            </div>
                        )) : <p className="rounded-2xl border border-amber-100 bg-white p-4 text-xs font-semibold text-slate-500">Not enough practice data yet. Keep using AI Tutor and this section will become more useful.</p>}
                    </div>
                    <button type="button" onClick={() => navigate("/ai-tutor")} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white">Practice weak topics <ArrowRight size={14} /></button>
                </div>

                <div className="rounded-[28px] border border-emerald-200/80 bg-emerald-50/60 p-6">
                    <div className="flex items-center gap-3 text-emerald-700"><CheckCircle2 size={18} /><span className="text-[10px] font-black uppercase tracking-wider">Strong areas</span></div>
                    <h2 className="mt-2 text-xl font-black text-slate-800">Topics you are handling well</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">These are the highest-accuracy topics in your recorded Tutor practice.</p>
                    <div className="mt-5 space-y-3">
                        {strongTopics.length ? strongTopics.map((item) => (
                            <div key={item.topic} className="rounded-2xl border border-emerald-100 bg-white p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-black text-slate-800">{item.topic}</p>
                                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-black text-emerald-700">{item.accuracy}%</span>
                                </div>
                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-emerald-100"><div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${item.accuracy}%` }} /></div>
                            </div>
                        )) : <p className="rounded-2xl border border-emerald-100 bg-white p-4 text-xs font-semibold text-slate-500">Your stronger areas will appear after you complete a few evaluated Tutor responses.</p>}
                    </div>
                </div>
            </section>

            <section className="mt-8 grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
                <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,.06)] transition duration-300 hover:shadow-[0_24px_60px_rgba(15,23,42,.08)]">
                    <div className="flex items-center justify-between gap-3">
                        <div><p className="text-[10px] font-black uppercase tracking-[.16em] text-blue-600">Topic analytics</p><h2 className="mt-1 text-xl font-black text-slate-800">Where your practice is going</h2></div>
                        <BarChart3 size={18} className="text-blue-600" />
                    </div>
                    <div className="mt-5 space-y-4">
                        {stats.topics.length ? stats.topics.slice(0, 8).map((item) => (
                            <div key={item.topic}>
                                <div className="flex items-center justify-between gap-3"><p className="text-xs font-black text-slate-700">{item.topic}</p><p className="text-[10px] font-black text-slate-400">{item.accuracy}% accuracy · {item.total} attempts</p></div>
                                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" style={{ width: `${item.accuracy}%` }} /></div>
                            </div>
                        )) : <p className="rounded-2xl bg-slate-50 p-4 text-xs font-semibold text-slate-500">No topic data yet. Start an AI Tutor session.</p>}
                    </div>
                </div>

                <div className="rounded-[28px] bg-gradient-to-br from-blue-600 to-cyan-500 p-6 text-white shadow-lg shadow-blue-500/15">
                    <Sparkles size={20} />
                    <p className="mt-5 text-[10px] font-black uppercase tracking-[.16em] text-cyan-100">Recommendation</p>
                    <h2 className="mt-2 text-2xl font-black">Your next move</h2>
                    <p className="mt-3 text-sm leading-6 text-blue-50">
                        {weakTopics.length
                            ? `Spend your next study block on ${weakTopics[0].topic}. Use AI Tutor Quiz Me or Challenge Me, then check this dashboard again.`
                            : stats.attempts.length
                            ? "Keep practicing. Once NoteShare has more evaluated responses, it can make stronger topic-level recommendations."
                            : "Start with one AI Tutor session. The dashboard needs a little learning activity before it can identify patterns."}
                    </p>
                    <button type="button" onClick={() => navigate("/ai-tutor")} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-black text-slate-900">Go to AI Tutor <ArrowRight size={14} /></button>
                </div>
            </section>

            <section className="mt-8 rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-slate-400">Recent activity</p><h2 className="mt-1 text-xl font-black text-slate-800">Latest learning signals</h2></div><Clock3 size={18} className="text-blue-600" /></div>
                <div className="mt-5 space-y-2">
                    {stats.recent.length ? stats.recent.map((item) => (
                        <div key={item.id} className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <div><p className="text-xs font-black text-slate-700">{item.topic || "General topic"}</p><p className="mt-0.5 text-[10px] font-semibold text-slate-400">{item.noteTitle} · {item.mode}</p></div>
                            <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase ${item.evaluation === "correct" ? "bg-emerald-100 text-emerald-700" : item.evaluation === "incorrect" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                                {item.evaluation === "correct" ? <CheckCircle2 size={11} /> : item.evaluation === "incorrect" ? <XCircle size={11} /> : <Target size={11} />} {item.evaluation}
                            </span>
                        </div>
                    )) : <p className="rounded-2xl bg-slate-50 p-4 text-xs font-semibold text-slate-500">No learning activity recorded yet.</p>}
                </div>
            </section>

            <p className="mt-5 text-center text-[10px] font-semibold text-slate-400">Learning Intelligence currently uses descriptive statistics and simple rules. It is not a medical, academic, or predictive assessment.</p>
        </section>
    );
}

export default LearningInsights;