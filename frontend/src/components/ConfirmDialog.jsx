import { AnimatePresence, motion } from "motion/react";
import {
    AlertTriangle,
    X,
} from "lucide-react";

function ConfirmDialog({
    open,
    title = "Are you sure?",
    message,
    confirmText = "Continue",
    cancelText = "Cancel",
    danger = false,
    onConfirm,
    onCancel,
}) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-950/45 px-5 backdrop-blur-sm"
                    onClick={onCancel}
                >
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 18,
                            scale: 0.97,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            y: 12,
                            scale: 0.97,
                        }}
                        transition={{
                            duration: 0.25,
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,.22)]"
                    >
                        <div className="flex items-start justify-between p-6">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`
                                        flex
                                        h-11
                                        w-11
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        ${
                                            danger
                                                ? "bg-red-50 text-red-500"
                                                : "bg-blue-50 text-blue-600"
                                        }
                                    `}
                                >
                                    <AlertTriangle size={20} />
                                </div>

                                <div>
                                    <h3 className="text-base font-black text-slate-900">
                                        {title}
                                    </h3>

                                    <p className="mt-1 text-xs font-semibold uppercase tracking-[.12em] text-slate-400">
                                        NoteShare security
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={onCancel}
                                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="px-6 pb-5">
                            <p className="text-sm leading-7 text-slate-500">
                                {message}
                            </p>
                        </div>

                        <div className="flex gap-3 border-t border-slate-100 bg-slate-50/70 p-5">
                            <button
                                onClick={onCancel}
                                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-600 transition hover:bg-slate-50"
                            >
                                {cancelText}
                            </button>

                            <button
                                onClick={onConfirm}
                                className={`
                                    flex-1
                                    rounded-xl
                                    px-4
                                    py-3
                                    text-xs
                                    font-black
                                    text-white
                                    transition
                                    hover:-translate-y-0.5
                                    ${
                                        danger
                                            ? "bg-red-500 hover:bg-red-600"
                                            : "bg-blue-600 hover:bg-blue-700"
                                    }
                                `}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default ConfirmDialog;