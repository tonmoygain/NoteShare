import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";

import {
    Send,
    X,
    Bot,
    Loader2,
    Trash2,
    Sparkles,
    BookOpen,
    ArrowUpRight,
    MessageCircle,
    FileText,
} from "lucide-react";

import API from "../services/api";

function AIAssistant() {
    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");

    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "Hi! I'm NoteShare AI. Ask me anything about the uploaded notes.",
        },
    ]);

    const [loading, setLoading] = useState(false);

    const clearChat = () => {
        setMessages([
            {
                role: "assistant",
                content:
                    "Hi! I'm NoteShare AI. Ask me anything about the uploaded notes.",
            },
        ]);
    };

    const sendMessage = async () => {
        const trimmedMessage = message.trim();

        if (!trimmedMessage || loading) {
            return;
        }

        setMessages((previous) => [
            ...previous,
            {
                role: "user",
                content: trimmedMessage,
            },
        ]);

        setMessage("");
        setLoading(true);

        try {
            const response = await API.post("ai/chat/", {
                message: trimmedMessage,
            });

            setMessages((previous) => [
                ...previous,
                {
                    role: "assistant",
                    content: response.data.reply,
                    sources: response.data.sources || [],
                },
            ]);
        } catch (error) {
            console.error("AI Assistant Error:", error);

            let errorMessage =
                "Sorry, I couldn't process your request.";

            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            }

            setMessages((previous) => [
                ...previous,
                {
                    role: "assistant",
                    content: errorMessage,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    const suggestedQuestions = [
        "Summarize my notes",
        "Explain this topic simply",
        "What are the key points?",
    ];

    return (
        <>
            {/* =====================================================
                FLOATING AI BUTTON
            ====================================================== */}

            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{
                            opacity: 0,
                            scale: 0.7,
                            y: 12,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.7,
                            y: 12,
                        }}
                        whileHover={{
                            scale: 1.06,
                            y: -2,
                        }}
                        whileTap={{
                            scale: 0.94,
                        }}
                        onClick={() => setIsOpen(true)}
                        className="
                            fixed
                            bottom-6
                            right-6
                            z-50
                            flex
                            h-16
                            w-16
                            items-center
                            justify-center
                            rounded-2xl
                            bg-gradient-to-br
                            from-blue-600
                            via-blue-500
                            to-cyan-400
                            text-white
                            shadow-[0_15px_35px_rgba(37,99,235,0.30)]
                            ring-1
                            ring-white/40
                        "
                        title="NoteShare AI Assistant"
                    >
                        <div className="absolute inset-0 rounded-2xl bg-white/10" />

                        <Bot
                            size={28}
                            strokeWidth={2.2}
                            className="relative z-10"
                        />

                        <span
                            className="
                                absolute
                                -right-1
                                -top-1
                                flex
                                h-5
                                w-5
                                items-center
                                justify-center
                                rounded-full
                                border-2
                                border-white
                                bg-emerald-400
                            "
                        >
                            <Sparkles
                                size={9}
                                className="text-white"
                            />
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* =====================================================
                CHAT WINDOW
            ====================================================== */}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 24,
                            scale: 0.97,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            y: 24,
                            scale: 0.97,
                        }}
                        transition={{
                            duration: 0.25,
                            ease: "easeOut",
                        }}
                        className="
                            ai-assistant-window

                            fixed
                            bottom-4
                            right-4
                            z-50
                            flex
                            h-[min(700px,calc(100vh-32px))]
                            w-[420px]
                            max-w-[calc(100vw-32px)]
                            flex-col
                            overflow-hidden
                            rounded-[28px]
                            border
                            border-slate-200/80
                            bg-white
                            shadow-[0_30px_90px_rgba(15,23,42,0.18)]

                            sm:bottom-6
                            sm:right-6
                        "
                    >
                        {/* =================================================
                            HEADER
                        ================================================== */}

                        <div
                            className="
                                ai-assistant-header

                                relative
                                overflow-hidden
                                bg-gradient-to-br
                                from-slate-950
                                via-blue-950
                                to-cyan-800
                                px-5
                                py-4
                                text-white
                            "
                        >
                            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-400/15 blur-3xl" />

                            <div className="relative flex items-center justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <motion.div
                                        animate={{
                                            y: [0, -2, 0],
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                        className="
                                            flex
                                            h-11
                                            w-11
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-2xl
                                            border
                                            border-white/10
                                            bg-white/10
                                            shadow-lg
                                            backdrop-blur-sm
                                        "
                                    >
                                        <Bot size={22} />
                                    </motion.div>

                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="truncate font-black">
                                                NoteShare AI
                                            </h3>

                                            <span
                                                className="
                                                    rounded-full
                                                    bg-emerald-400/15
                                                    px-2
                                                    py-0.5
                                                    text-[9px]
                                                    font-black
                                                    uppercase
                                                    tracking-wider
                                                    text-emerald-200
                                                "
                                            >
                                                Online
                                            </span>
                                        </div>

                                        <p className="mt-0.5 truncate text-[11px] text-blue-100">
                                            Your note-aware study assistant
                                        </p>
                                    </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-1">
                                    <button
                                        onClick={clearChat}
                                        className="
                                            ai-assistant-header-button
                                            rounded-xl
                                            p-2
                                            text-blue-100
                                            transition
                                            hover:bg-white/10
                                            hover:text-white
                                        "
                                        title="Clear chat"
                                    >
                                        <Trash2 size={17} />
                                    </button>

                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="
                                            ai-assistant-header-button
                                            rounded-xl
                                            p-2
                                            text-blue-100
                                            transition
                                            hover:bg-white/10
                                            hover:text-white
                                        "
                                        title="Close"
                                    >
                                        <X size={19} />
                                    </button>
                                </div>
                            </div>

                            <div
                                className="
                                    relative
                                    mt-4
                                    flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    border
                                    border-white/10
                                    bg-white/5
                                    px-3
                                    py-2
                                    text-[10px]
                                    font-semibold
                                    text-slate-300
                                    backdrop-blur-sm
                                "
                            >
                                <FileText
                                    size={13}
                                    className="text-cyan-300"
                                />

                                Answers are based on uploaded NoteShare content.
                            </div>
                        </div>

                        {/* =================================================
                            MESSAGES
                        ================================================== */}

                        <div
                            className="
                                ai-assistant-messages

                                flex-1
                                overflow-y-auto
                                bg-gradient-to-b
                                from-slate-50
                                to-white
                                px-4
                                py-5
                            "
                        >
                            {/* Suggested prompts */}

                            {messages.length === 1 && !loading && (
                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        y: 8,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    className="mb-5"
                                >
                                    <p
                                        className="
                                            ai-assistant-section-label

                                            mb-2
                                            text-[10px]
                                            font-black
                                            uppercase
                                            tracking-[0.15em]
                                            text-slate-400
                                        "
                                    >
                                        Try asking
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        {suggestedQuestions.map(
                                            (question) => (
                                                <button
                                                    key={question}
                                                    type="button"
                                                    onClick={() =>
                                                        setMessage(question)
                                                    }
                                                    className="
                                                        ai-assistant-suggestion

                                                        rounded-full
                                                        border
                                                        border-blue-100
                                                        bg-blue-50
                                                        px-3
                                                        py-2
                                                        text-left
                                                        text-[11px]
                                                        font-bold
                                                        text-blue-600
                                                        transition
                                                        hover:border-blue-200
                                                        hover:bg-blue-100
                                                    "
                                                >
                                                    {question}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            <div className="space-y-4">
                                {messages.map((item, index) => {
                                    const isUser =
                                        item.role === "user";

                                    return (
                                        <motion.div
                                            key={`${item.role}-${index}`}
                                            initial={{
                                                opacity: 0,
                                                y: 10,
                                                scale: 0.98,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                                scale: 1,
                                            }}
                                            transition={{
                                                duration: 0.25,
                                            }}
                                            className={
                                                isUser
                                                    ? "flex justify-end"
                                                    : "flex justify-start"
                                            }
                                        >
                                            {!isUser && (
                                                <div
                                                    className="
                                                        mr-2
                                                        mt-1
                                                        flex
                                                        h-8
                                                        w-8
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        rounded-xl
                                                        bg-gradient-to-br
                                                        from-blue-600
                                                        to-cyan-500
                                                        text-white
                                                        shadow-sm
                                                    "
                                                >
                                                    <Bot size={16} />
                                                </div>
                                            )}

                                            <div
                                                className={
                                                    isUser
                                                        ? `
                                                            ai-assistant-user-message

                                                            max-w-[82%]
                                                            rounded-2xl
                                                            rounded-br-md
                                                            bg-gradient-to-br
                                                            from-blue-600
                                                            to-blue-500
                                                            px-4
                                                            py-3
                                                            text-sm
                                                            leading-6
                                                            text-white
                                                            shadow-md
                                                            shadow-blue-500/10
                                                        `
                                                        : `
                                                            ai-assistant-ai-message

                                                            max-w-[84%]
                                                            rounded-2xl
                                                            rounded-bl-md
                                                            border
                                                            border-slate-200
                                                            bg-white
                                                            px-4
                                                            py-3
                                                            text-sm
                                                            leading-6
                                                            text-slate-700
                                                            shadow-sm
                                                        `
                                                }
                                            >
                                                <p className="whitespace-pre-wrap break-words">
                                                    {item.content}
                                                </p>

                                                {/* Sources */}

                                                {item.sources?.length > 0 && (
                                                    <div
                                                        className="
                                                            ai-assistant-sources

                                                            mt-3
                                                            border-t
                                                            border-slate-200
                                                            pt-3
                                                        "
                                                    >
                                                        <div
                                                            className="
                                                                mb-2
                                                                flex
                                                                items-center
                                                                gap-2
                                                            "
                                                        >
                                                            <BookOpen
                                                                size={13}
                                                                className="
                                                                    ai-assistant-source-icon
                                                                    text-blue-600
                                                                "
                                                            />

                                                            <p
                                                                className="
                                                                    ai-assistant-source-label

                                                                    text-[10px]
                                                                    font-black
                                                                    uppercase
                                                                    tracking-wider
                                                                    text-slate-400
                                                                "
                                                            >
                                                                Note Sources
                                                            </p>
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            {item.sources.map(
                                                                (source) => (
                                                                    <button
                                                                        key={
                                                                            source.id
                                                                        }
                                                                        onClick={() =>
                                                                            navigate(
                                                                                `/note/${source.id}`
                                                                            )
                                                                        }
                                                                        className="
                                                                            ai-assistant-source-card

                                                                            group
                                                                            flex
                                                                            w-full
                                                                            items-center
                                                                            justify-between
                                                                            gap-2
                                                                            rounded-xl
                                                                            border
                                                                            border-blue-100
                                                                            bg-blue-50
                                                                            px-3
                                                                            py-2.5
                                                                            text-left
                                                                            transition
                                                                            hover:border-blue-200
                                                                            hover:bg-blue-100
                                                                        "
                                                                    >
                                                                        <span
                                                                            className="
                                                                                ai-assistant-source-title

                                                                                line-clamp-2
                                                                                min-w-0
                                                                                text-[11px]
                                                                                font-bold
                                                                                text-blue-700
                                                                            "
                                                                        >
                                                                            {
                                                                                source.title
                                                                            }
                                                                        </span>

                                                                        <ArrowUpRight
                                                                            size={14}
                                                                            className="
                                                                                ai-assistant-source-arrow

                                                                                shrink-0
                                                                                text-blue-400
                                                                                transition
                                                                                group-hover:translate-x-0.5
                                                                                group-hover:-translate-y-0.5
                                                                            "
                                                                        />
                                                                    </button>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}

                                {/* AI loading */}

                                <AnimatePresence>
                                    {loading && (
                                        <motion.div
                                            initial={{
                                                opacity: 0,
                                                y: 8,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                y: 8,
                                            }}
                                            className="flex items-end gap-2"
                                        >
                                            <div
                                                className="
                                                    flex
                                                    h-8
                                                    w-8
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    bg-gradient-to-br
                                                    from-blue-600
                                                    to-cyan-500
                                                    text-white
                                                "
                                            >
                                                <Bot size={16} />
                                            </div>

                                            <div
                                                className="
                                                    ai-assistant-loading

                                                    flex
                                                    items-center
                                                    gap-1
                                                    rounded-2xl
                                                    rounded-bl-md
                                                    border
                                                    border-slate-200
                                                    bg-white
                                                    px-4
                                                    py-3
                                                    shadow-sm
                                                "
                                            >
                                                <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]" />
                                                <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.15s]" />
                                                <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* =================================================
                            INPUT
                        ================================================== */}

                        <div
                            className="
                                ai-assistant-footer

                                border-t
                                border-slate-200
                                bg-white
                                p-3
                            "
                        >
                            <div
                                className="
                                    ai-assistant-input-wrapper

                                    flex
                                    items-end
                                    gap-2
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    p-2
                                    transition

                                    focus-within:border-blue-300
                                    focus-within:bg-white
                                    focus-within:ring-4
                                    focus-within:ring-blue-100
                                "
                            >
                                <textarea
                                    value={message}
                                    onChange={(event) =>
                                        setMessage(
                                            event.target.value
                                        )
                                    }
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask about your notes..."
                                    rows={1}
                                    disabled={loading}
                                    className="
                                        ai-assistant-textarea

                                        max-h-24
                                        min-h-[40px]
                                        flex-1
                                        resize-none
                                        bg-transparent
                                        px-2
                                        py-2
                                        text-sm
                                        leading-6
                                        text-slate-700
                                        outline-none
                                        placeholder:text-slate-400
                                        disabled:cursor-not-allowed
                                        disabled:opacity-60
                                    "
                                />

                                <motion.button
                                    onClick={sendMessage}
                                    disabled={
                                        loading ||
                                        !message.trim()
                                    }
                                    whileHover={
                                        !loading &&
                                        message.trim()
                                            ? {
                                                  scale: 1.04,
                                              }
                                            : {}
                                    }
                                    whileTap={{
                                        scale: 0.95,
                                    }}
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-gradient-to-br
                                        from-blue-600
                                        to-cyan-500
                                        text-white
                                        shadow-md
                                        shadow-blue-500/15
                                        transition
                                        disabled:cursor-not-allowed
                                        disabled:opacity-40
                                    "
                                    title="Send message"
                                >
                                    {loading ? (
                                        <Loader2
                                            size={18}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <Send size={18} />
                                    )}
                                </motion.button>
                            </div>

                            <div
                                className="
                                    ai-assistant-footer-hint

                                    mt-2
                                    flex
                                    items-center
                                    justify-center
                                    gap-1.5
                                    text-[10px]
                                    font-semibold
                                    text-slate-400
                                "
                            >
                                <MessageCircle size={11} />
                                Enter to send · Shift + Enter for a new line
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default AIAssistant;