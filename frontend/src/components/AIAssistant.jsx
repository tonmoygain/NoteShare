import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { 
    Send, 
    X, 
    Bot, 
    Loader2,
    Trash2
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
                "Hi! I'm NoteShare AI. Ask me something about the uploaded notes."
        }
    ]);

    const [loading, setLoading] = useState(false);

    const clearChat = () => {

        setMessages([
            {
                role: "assistant",
                content:
                    "Hi! I'm NoteShare AI. Ask me something about the uploaded notes."
            }
        ]);
    };


    const sendMessage = async () => {

        const trimmedMessage = message.trim();

        if (!trimmedMessage || loading) {
            return;
        }


        // Add user's message
        setMessages((previous) => [

            ...previous,

            {
                role: "user",
                content: trimmedMessage
            }

        ]);


        setMessage("");

        setLoading(true);


        try {

            const response = await API.post(
                "ai/chat/",
                {
                    message: trimmedMessage
                }
            );


            setMessages((previous) => [

                ...previous,

                {
                    role: "assistant",
                    content:
                        response.data.reply,

                    sources:
                        response.data.sources || []
                }

            ]);

        } catch (error) {

            console.error(
                "AI Assistant Error:",
                error
            );


            let errorMessage =
                "Sorry, I couldn't process your request.";


            if (
                error.response?.data?.error
            ) {

                errorMessage =
                    error.response.data.error;

            }


            setMessages((previous) => [

                ...previous,

                {
                    role: "assistant",
                    content: errorMessage
                }

            ]);

        } finally {

            setLoading(false);

        }

    };


    const handleKeyDown = (event) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();

        }

    };


    return (

        <>

            {/* Floating AI Button */}

            {!isOpen && (

                <button
                    onClick={() =>
                        setIsOpen(true)
                    }
                    className="
                        fixed
                        bottom-6
                        right-6
                        z-50
                        w-14
                        h-14
                        rounded-full
                        bg-blue-600
                        text-white
                        shadow-xl
                        flex
                        items-center
                        justify-center
                        hover:bg-blue-700
                        transition
                    "
                    title="NoteShare AI Assistant"
                >

                    <Bot size={27} />

                </button>

            )}


            {/* Chat Window */}

            {isOpen && (

                <div
                    className="
                        fixed
                        bottom-6
                        right-6
                        z-50
                        w-[380px]
                        max-w-[calc(100vw-32px)]
                        h-[560px]
                        bg-white
                        rounded-2xl
                        shadow-2xl
                        border
                        border-slate-200
                        flex
                        flex-col
                        overflow-hidden
                    "
                >

                    {/* Header */}

                    <div
                        className="
                            bg-blue-600
                            text-white
                            px-5
                            py-4
                            flex
                            items-center
                            justify-between
                        "
                    >

                        <div className="flex items-center gap-3">

                            <div
                                className="
                                    w-10
                                    h-10
                                    rounded-full
                                    bg-white/20
                                    flex
                                    items-center
                                    justify-center
                                "
                            >

                                <Bot size={22} />

                            </div>

                            <div>

                                <h3 className="font-semibold">
                                    NoteShare AI
                                </h3>

                                <p className="text-xs text-blue-100">
                                    AI powered note assistant
                                </p>

                            </div>

                        </div>


                        <div className="flex items-center gap-1">

                            <button
                                onClick={clearChat}
                                className="
                                    hover:bg-white/10
                                    rounded-lg
                                    p-2
                                    transition
                                "
                                title="Clear chat"
                            >
                                <Trash2 size={18} />

                            </button>

                            <button
                                onClick={() =>
                                    setIsOpen(false)
                                }
                                className="
                                    hover:bg-white/10
                                    rounded-lg
                                    p-2
                                    transition
                                "
                                title="Close"
                            >
                                <X size={20} />
                                
                            </button>

                        </div>

                    </div>


                    {/* Messages */}

                    <div
                        className="
                            flex-1
                            overflow-y-auto
                            p-4
                            space-y-4
                            bg-slate-50
                        "
                    >

                        {messages.map(
                            (item, index) => (

                                <div
                                    key={index}
                                    className={
                                        item.role === "user"
                                            ? "flex justify-end"
                                            : "flex justify-start"
                                    }
                                >

                                    <div
                                        className={
                                            item.role === "user"
                                                ? `
                                                    max-w-[80%]
                                                    bg-blue-600
                                                    text-white
                                                    rounded-2xl
                                                    rounded-br-md
                                                    px-4
                                                    py-3
                                                    text-sm
                                                `
                                                : `
                                                    max-w-[85%]
                                                    bg-white
                                                    border
                                                    border-slate-200
                                                    text-slate-700
                                                    rounded-2xl
                                                    rounded-bl-md
                                                    px-4
                                                    py-3
                                                    text-sm
                                                    shadow-sm
                                                `
                                        }
                                    >

                                        <p className="whitespace-pre-wrap">
                                            {item.content}
                                        </p>


                                        {/* Sources */}

                                        {item.sources?.length > 0 && (

                                            <div className="mt-3 pt-3 border-t border-slate-200">

                                                <p className="text-xs font-semibold text-slate-500 mb-2">
                                                    Sources
                                                </p>

                                                {item.sources.map(
                                                    (source) => (

                                                        <button
                                                            key={source.id}
                                                            onClick={() => navigate(`/note/${source.id}`)}
                                                            className="
                                                                w-full
                                                                text-left
                                                                text-xs
                                                                text-blue-600
                                                                bg-blue-50
                                                                hover:bg-blue-100
                                                                rounded-lg
                                                                px-3
                                                                py-2
                                                                mb-1
                                                                transition
                                                                cursor-pointer
                                                            "
                                                        >

                                                            {source.title}

                                                        </button>

                                                    )
                                                )}

                                            </div>

                                        )}

                                    </div>

                                </div>

                            )
                        )}


                        {/* Loading */}

                        {loading && (

                            <div className="flex justify-start">

                                <div
                                    className="
                                        bg-white
                                        border
                                        border-slate-200
                                        rounded-2xl
                                        rounded-bl-md
                                        px-4
                                        py-3
                                        shadow-sm
                                    "
                                >

                                    <Loader2
                                        size={18}
                                        className="animate-spin text-blue-600"
                                    />

                                </div>

                            </div>

                        )}

                    </div>


                    {/* Input */}

                    <div
                        className="
                            p-3
                            border-t
                            border-slate-200
                            bg-white
                        "
                    >

                        <div
                            className="
                                flex
                                items-end
                                gap-2
                                bg-slate-100
                                rounded-xl
                                p-2
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
                                className="
                                    flex-1
                                    resize-none
                                    bg-transparent
                                    outline-none
                                    text-sm
                                    text-slate-700
                                    px-2
                                    py-2
                                    max-h-24
                                "
                            />


                            <button
                                onClick={sendMessage}
                                disabled={
                                    loading ||
                                    !message.trim()
                                }
                                className="
                                    w-10
                                    h-10
                                    rounded-lg
                                    bg-blue-600
                                    text-white
                                    flex
                                    items-center
                                    justify-center
                                    disabled:opacity-50
                                    disabled:cursor-not-allowed
                                    hover:bg-blue-700
                                    transition
                                "
                            >

                                <Send size={18} />

                            </button>

                        </div>


                        <p className="text-[10px] text-slate-400 text-center mt-2">
                            Answers are based on uploaded NoteShare content.
                        </p>

                    </div>

                </div>

            )}

        </>

    );

}

export default AIAssistant;