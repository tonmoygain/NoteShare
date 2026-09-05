import { AnimatePresence, motion } from "motion/react";
import {
    CheckCircle2,
    AlertCircle,
    X,
} from "lucide-react";

function Toast({
    toast,
    onClose,
}) {
    if (!toast) return null;

    const isError = toast.type === "error";

    return (
        <AnimatePresence>
            <motion.div
                key="toast"
                initial={{
                    opacity: 0,
                    y: -20,
                    scale: 0.96,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                }}
                exit={{
                    opacity: 0,
                    y: -12,
                    scale: 0.96,
                }}
                transition={{
                    duration: 0.28,
                    ease: [0.16, 1, 0.3, 1],
                }}
                className="fixed right-5 top-5 z-[9999] w-[calc(100%-40px)] max-w-sm"
            >
                <div
                    className={`
                        relative
                        overflow-hidden
                        rounded-2xl
                        border
                        bg-white/95
                        p-4
                        shadow-[0_25px_70px_rgba(15,23,42,.16)]
                        backdrop-blur-2xl
                        ${
                            isError
                                ? "border-red-100"
                                : "border-emerald-100"
                        }
                    `}
                >
                    <div
                        className={`
                            absolute
                            left-0
                            top-0
                            h-full
                            w-1
                            ${
                                isError
                                    ? "bg-red-500"
                                    : "bg-emerald-500"
                            }
                        `}
                    />

                    <div className="flex items-start gap-3">
                        <div
                            className={`
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                ${
                                    isError
                                        ? "bg-red-50 text-red-500"
                                        : "bg-emerald-50 text-emerald-500"
                                }
                            `}
                        >
                            {isError ? (
                                <AlertCircle size={19} />
                            ) : (
                                <CheckCircle2 size={19} />
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-black text-slate-900">
                                {isError
                                    ? "Something went wrong"
                                    : "Success"}
                            </p>

                            <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                                {toast.message}
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                            <X size={15} />
                        </button>
                    </div>

                    <motion.div
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{
                            duration: 3.5,
                            ease: "linear",
                        }}
                        onAnimationComplete={onClose}
                        className={`
                            absolute
                            bottom-0
                            left-0
                            h-[2px]
                            ${
                                isError
                                    ? "bg-red-400"
                                    : "bg-emerald-400"
                            }
                        `}
                    />
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

export default Toast;