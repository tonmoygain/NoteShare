import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

import {
    MessageSquare,
    Users,
    ArrowLeft,
    ArrowRight,
    Hash,
    Loader2,
    LogIn,
    LogOut,
    Send,
    Sparkles,
    ShieldCheck,
    Clock3,
} from "lucide-react";

function RoomDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [room, setRoom] = useState(null);
    const [childRooms, setChildRooms] = useState([]);

    const [loading, setLoading] = useState(true);

    const [isMember, setIsMember] = useState(false);
    const [joining, setJoining] = useState(false);
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    const messagesEndRef = useRef(null);

    const username =
        localStorage.getItem("username") ||
        "Student";

    useEffect(() => {
        loadRoom();
    }, [id]);

    const loadRoom = async () => {
        try {
            setLoading(true);

            const roomResponse = await API.get(
                `discussion/rooms/${id}/`
            );

            const roomData = roomResponse.data;

            setRoom(roomData);

            setChildRooms(
                roomData.child_rooms || []
            );

            const messageResponse =
                await API.get(
                    `discussion/rooms/${id}/messages/`
                );

            setMessages(
                Array.isArray(messageResponse.data)
                    ? messageResponse.data
                    : []
            );
        } catch (error) {
            console.error(
                "Room Details Error:",
                error
            );

            console.error(
                "Status:",
                error.response?.status
            );

            console.error(
                "Response:",
                error.response?.data
            );

            setRoom(null);
            setChildRooms([]);
            setMessages([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!id) return;

        const interval = setInterval(
            async () => {
                try {
                    const response =
                        await API.get(
                            `discussion/rooms/${id}/messages/`
                        );

                    const data =
                        Array.isArray(response.data)
                            ? response.data
                            : [];

                    setMessages(data);
                } catch (error) {
                    console.error(
                        "Message refresh error:",
                        error
                    );
                }
            },
            3000
        );

        return () =>
            clearInterval(interval);
    }, [id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);

    const joinRoom = async () => {
        try {
            const token =
                localStorage.getItem("access");

            if (!token) {
                alert(
                    "Please login first to join this room."
                );

                navigate("/login");
                return;
            }

            setJoining(true);

            const response = await API.post(
                `discussion/rooms/${id}/join/`
            );

            setIsMember(true);

            setRoom((prev) => {
                if (!prev) return prev;

                return {
                    ...prev,
                    member_count:
                        response.data
                            .member_count ??
                        prev.member_count,
                };
            });

            alert(
                "Joined the discussion room successfully."
            );
        } catch (error) {
            console.error(
                "JOIN ERROR:",
                error
            );

            if (
                error.response?.status === 401
            ) {
                alert(
                    "Please login first to join this room."
                );

                navigate("/login");
            } else {
                alert(
                    error.response?.data
                        ?.detail ||
                        error.response?.data
                            ?.error ||
                        "Could not join the room."
                );
            }
        } finally {
            setJoining(false);
        }
    };

    const leaveRoom = async () => {
        try {
            setJoining(true);

            await API.post(
                `discussion/rooms/${id}/leave/`
            );

            setIsMember(false);

            alert(
                "You left the discussion room."
            );

            await loadRoom();
        } catch (error) {
            console.error(
                "Leave Room Error:",
                error
            );

            if (
                error.response?.status === 401
            ) {
                alert("Please login first.");
                navigate("/login");
            } else {
                alert(
                    "Could not leave the room."
                );
            }
        } finally {
            setJoining(false);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();

        const text = message.trim();

        if (!text) return;

        try {
            setSending(true);

            const response = await API.post(
                `discussion/rooms/${id}/messages/create/`,
                {
                    message: text,
                }
            );

            setMessages((prev) => [
                ...prev,
                response.data,
            ]);

            setMessage("");
        } catch (error) {
            console.error(
                "Send Message Error:",
                error
            );

            if (
                error.response?.status === 401
            ) {
                alert(
                    "Please login first to send a message."
                );

                navigate("/login");
            } else {
                alert(
                    "Could not send message."
                );
            }
        } finally {
            setSending(false);
        }
    };


    if (!room && !loading) {
        return (
            <div className="min-h-[70vh] px-6 flex items-center justify-center">
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 15,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    className="room-details-error-card w-full max-w-lg rounded-[30px] border border-slate-200 bg-white p-10 text-center shadow-xl"
                >
                    <div className="room-details-error-icon mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <MessageSquare size={28} />
                    </div>

                    <h2 className="mt-6 text-3xl font-black text-slate-800">
                        Room Not Found
                    </h2>

                    <p className="mt-3 text-slate-500">
                        This discussion room may no longer exist.
                    </p>

                    <button
                        onClick={() =>
                            navigate("/rooms")
                        }
                        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg"
                    >
                        <ArrowLeft size={18} />
                        Back to Discussion
                    </button>
                </motion.div>
            </div>
        );
    }

    if (!room) {
        return null;
    }

    const isParentRoom =
        !room.parent_room;

    return (
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">

            {/* =====================================================
                BACK
            ====================================================== */}

            <button
                
                onClick={() =>
                    isParentRoom
                        ? navigate("/rooms")
                        : navigate(
                              `/rooms/${room.parent_room}`
                          )
                }
                className="room-details-back group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm backdrop-blur-sm transition hover:border-blue-200 hover:text-blue-600"
            >
                <ArrowLeft
                    size={17}
                    className="transition-transform duration-300 group-hover:-translate-x-0.5"
                />

                {isParentRoom
                    ? "Back to Discussion Rooms"
                    : "Back to Study Room"}
            </button>

            {/* =====================================================
                ROOM HERO
            ====================================================== */}

            <div
                
                className="room-details-hero relative mt-7 overflow-hidden rounded-[34px] bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-900 p-7 text-white shadow-[0_25px_70px_rgba(15,23,42,0.14)] sm:p-9 lg:p-10"
            >
                <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />

                <div className="pointer-events-none absolute right-1/3 top-1/3 h-48 w-48 rounded-full bg-indigo-400/10 blur-3xl" />

                <div className="relative">
                    <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

                        <div className="max-w-3xl">

                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur-sm">
                                    <MessageSquare size={15} />
                                    {room.category ||
                                        "Discussion"}
                                </span>

                                {room.department && (
                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold text-blue-100 backdrop-blur-sm">
                                        <Hash size={14} />
                                        {room.department}
                                    </span>
                                )}
                            </div>

                            <h1 className="mt-5 break-words text-4xl font-black tracking-tight sm:text-5xl">
                                {room.name}
                            </h1>

                            <p className="mt-4 max-w-2xl text-base leading-8 text-blue-100 sm:text-lg">
                                {room.description ||
                                    "Join this discussion and connect with other students."}
                            </p>

                            <div className="mt-6 flex flex-wrap gap-4 text-sm text-blue-100">
                                <span className="inline-flex items-center gap-2">
                                    <Users size={17} />
                                    {room.member_count ||
                                        0}{" "}
                                    students
                                </span>

                                <span className="inline-flex items-center gap-2">
                                    <Clock3 size={17} />
                                    Active discussion
                                </span>
                            </div>
                        </div>

                        {!isParentRoom && (
                            <div className="shrink-0">
                                {isMember ? (
                                    <motion.button
                                        whileHover={{
                                            y: -2,
                                        }}
                                        whileTap={{
                                            scale: 0.98,
                                        }}
                                        onClick={
                                            leaveRoom
                                        }
                                        disabled={
                                            joining
                                        }
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 font-bold text-white backdrop-blur-sm transition hover:border-red-300/30 hover:bg-red-500/20 disabled:opacity-50 sm:w-auto"
                                    >
                                        {joining ? (
                                            <Loader2
                                                size={18}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <LogOut
                                                size={18}
                                            />
                                        )}

                                        {joining
                                            ? "Leaving..."
                                            : "Leave Room"}
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        whileHover={{
                                            y: -2,
                                        }}
                                        whileTap={{
                                            scale: 0.98,
                                        }}
                                        onClick={
                                            joinRoom
                                        }
                                        disabled={
                                            joining
                                        }
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-black text-blue-700 shadow-lg transition hover:bg-blue-50 hover:shadow-xl disabled:opacity-50 sm:w-auto"
                                    >
                                        {joining ? (
                                            <>
                                                <Loader2
                                                    size={18}
                                                    className="animate-spin"
                                                />
                                                Joining...
                                            </>
                                        ) : (
                                            <>
                                                <LogIn
                                                    size={18}
                                                />
                                                Join Room
                                            </>
                                        )}
                                    </motion.button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex flex-wrap gap-2 border-t border-white/10 pt-6">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300">
                            <ShieldCheck size={14} />
                            Student community
                        </span>

                        {isParentRoom ? (
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300">
                                Department hub
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300">
                                {isMember
                                    ? "Member access"
                                    : "Read only"}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* =====================================================
                PARENT ROOM
            ====================================================== */}

            {isParentRoom ? (
                <div className="room-study-icon section mt-12">
                    <div className="flex items-center gap-3">
                        <div className="room-study-icon flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Hash size={21} />
                        </div>

                        <div>
                            <h2 className="text-2xl font-black text-slate-800">
                                Department Rooms
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Choose a department to join its discussion.
                            </p>
                        </div>
                    </div>

                    {childRooms.length > 0 ? (
                        <div className="mt-7 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {childRooms.map(
                                (
                                    child,
                                    index
                                ) => (
                                    <div
                                        key={child.id}
                                        onClick={() =>
                                            navigate(
                                                `/rooms/${child.id}`
                                            )
                                        }
                                        className="room-child-card group cursor-pointer overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.045)] transition-shadow duration-300 hover:shadow-[0_24px_50px_rgba(15,23,42,0.09)]"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:scale-105">
                                                <MessageSquare size={23} />
                                            </div>

                                            <ArrowRight
                                                size={20}
                                                className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"
                                            />
                                        </div>

                                        <h3 className="mt-5 line-clamp-2 text-xl font-black text-slate-800 transition group-hover:text-blue-600">
                                            {child.name}
                                        </h3>

                                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                                            {child.description ||
                                                "Join this department room for focused discussion."}
                                        </p>

                                        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
                                                <Users
                                                    size={16}
                                                />
                                                {child.member_count ||
                                                    0}{" "}
                                                students
                                            </div>

                                            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-blue-600">
                                                Open
                                            </span>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    ) : (
                        <div className="room-child-empty mt-7 rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                                <Hash size={28} />
                            </div>

                            <h3 className="mt-5 text-lg font-black text-slate-700">
                                No department rooms yet
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                                This study room does not have any department spaces yet.
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                /* =====================================================
                   DEPARTMENT DISCUSSION
                ====================================================== */

                <div className="mt-10 grid gap-7 lg:grid-cols-[1fr_320px]">

                    {/* Chat */}

                    <div
                        
                        className="room-chat-card overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-[0_15px_40px_rgba(15,23,42,0.06)]"
                    >

                        {/* Chat Header */}

                        <div className="room-chat-header border-b border-slate-100 bg-white px-5 py-5 sm:px-6">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <MessageSquare size={21} />
                                    </div>

                                    <div className="min-w-0">
                                        <h2 className="truncate text-xl font-black text-slate-800">
                                            {room.department ||
                                                room.name}{" "}
                                            Discussion
                                        </h2>

                                        <p className="mt-1 text-xs text-slate-400">
                                            Ask questions and share ideas with other students.
                                        </p>
                                    </div>
                                </div>

                                {isMember ? (
                                    <div className="inline-flex shrink-0 items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-600">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.45)]" />
                                        Joined
                                    </div>
                                ) : (
                                    <div className="inline-flex shrink-0 items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500">
                                        <span className="h-2 w-2 rounded-full bg-slate-400" />
                                        Read Only
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Messages */}

                        <div className="room-messages h-[500px] overflow-y-auto bg-slate-50/70 px-4 py-5 sm:px-6 sm:py-6">
                            {messages.length === 0 ? (
                                <div className="flex h-full items-center justify-center text-center">
                                    <div className="max-w-sm">
                                        <motion.div
                                            animate={{
                                                y: [0, -4, 0],
                                            }}
                                            transition={{
                                                duration: 3.5,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                            }}
                                            className="room-empty-icon mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-100 bg-white text-blue-500 shadow-sm"
                                        >
                                            <MessageSquare size={28} />
                                        </motion.div>

                                        <h3 className="mt-4 font-black text-slate-700">
                                            No messages yet
                                        </h3>

                                        <p className="mt-1 text-sm leading-6 text-slate-400">
                                            {isMember
                                                ? "Be the first student to start the discussion."
                                                : "Join this room to start participating in the discussion."}
                                        </p>

                                        {!isMember && (
                                            <button
                                                type="button"
                                                onClick={
                                                    joinRoom
                                                }
                                                disabled={
                                                    joining
                                                }
                                                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                <LogIn size={16} />
                                                Join Room
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                messages.map(
                                    (item) => {
                                        const ownMessage =
                                            item.username ===
                                            username;

                                        return (
                                            <div
                                                key={
                                                    item.id
                                                }
                                                className={`mb-4 flex ${
                                                    ownMessage
                                                        ? "justify-end"
                                                        : "justify-start"
                                                }`}
                                            >
                                                <div
                                                    className={`max-w-[85%] min-w-[120px] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[75%] ${
                                                        ownMessage
                                                            ? "rounded-br-md bg-blue-600 text-white"
                                                            : "room-other-message rounded-bl-md border border-slate-100 bg-white text-slate-700"
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between gap-4">
                                                        <p
                                                            className={`text-xs font-bold ${
                                                                ownMessage
                                                                    ? "text-blue-100"
                                                                    : "text-blue-600"
                                                            }`}
                                                        >
                                                            {item.username ||
                                                                "Student"}
                                                        </p>

                                                        {ownMessage && (
                                                            <span className="text-[9px] font-semibold uppercase tracking-wider text-blue-200">
                                                                You
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="mt-1 break-words whitespace-pre-wrap leading-6">
                                                        {item.message}
                                                    </p>

                                                    <div
                                                        className={`mt-2 text-[10px] ${
                                                            ownMessage
                                                                ? "text-right text-blue-100"
                                                                : "text-left text-slate-400"
                                                        }`}
                                                    >
                                                        {item.created_at
                                                            ? new Date(
                                                                  item.created_at
                                                              ).toLocaleTimeString(
                                                                  [],
                                                                  {
                                                                      hour: "2-digit",
                                                                      minute: "2-digit",
                                                                  }
                                                              )
                                                            : ""}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                )
                            )}

                            <div
                                ref={
                                    messagesEndRef
                                }
                            />
                        </div>

                        {/* Input */}

                        <form
                            onSubmit={
                                sendMessage
                            }
                            className="room-message-form border-t border-slate-100 bg-white p-4 sm:p-5"
                        >
                            {!isMember && (
                                <div className="room-join-warning mb-3 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs font-semibold leading-5 text-amber-700">
                                    <ShieldCheck
                                        size={15}
                                        className="mt-0.5 shrink-0"
                                    />
                                    Join this room to participate in the discussion.
                                </div>
                            )}

                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(
                                        e
                                    ) =>
                                        setMessage(
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                    onKeyDown={(
                                        e
                                    ) => {
                                        if (
                                            e.key ===
                                                "Enter" &&
                                            !e.shiftKey
                                        ) {
                                            e.preventDefault();

                                            if (
                                                isMember &&
                                                !sending &&
                                                message.trim()
                                            ) {
                                                sendMessage(
                                                    e
                                                );
                                            }
                                        }
                                    }}
                                    placeholder={
                                        isMember
                                            ? "Write a message..."
                                            : "Join the room to participate..."
                                    }
                                    disabled={
                                        !isMember ||
                                        sending
                                    }
                                    className="room-message-input h-12 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                                />

                                <motion.button
                                    type="submit"
                                    whileHover={
                                        isMember &&
                                        !sending &&
                                        message.trim()
                                            ? {
                                                  y: -1,
                                              }
                                            : {}
                                    }
                                    whileTap={{
                                        scale: 0.97,
                                    }}
                                    disabled={
                                        !isMember ||
                                        sending ||
                                        !message.trim()
                                    }
                                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {sending ? (
                                        <Loader2
                                            size={19}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <Send size={19} />
                                    )}
                                </motion.button>
                            </div>

                            {isMember && (
                                <p className="mt-2 px-1 text-[11px] text-slate-400">
                                    Press Enter to send your message.
                                </p>
                            )}
                        </form>
                    </div>

                    {/* Sidebar */}

                    <div className="space-y-5">

                        {/* Room Information */}

                        <motion.div
                            initial={{
                                opacity: 0,
                                x: 12,
                            }}
                            animate={{
                                opacity: 1,
                                x: 0,
                            }}
                            transition={{
                                duration: 0.45,
                                delay: 0.08,
                            }}
                            className="room-info-card overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.045)]"
                        >
                            <div className="room-info-header border-b border-slate-100 px-6 py-5">
                                <div className="room-info-item flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <Hash size={19} />
                                    </div>

                                    <div>
                                        <h3 className="font-black text-slate-800">
                                            Room Information
                                        </h3>

                                        <p className="mt-1 text-xs text-slate-400">
                                            Details about this discussion room.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5 p-6">

                                <div className="room-info-item flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                                        <Hash size={17} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            Department
                                        </p>

                                        <p className="mt-1 truncate font-bold text-slate-700">
                                            {room.department ||
                                                "General"}
                                        </p>
                                    </div>
                                </div>

                                <div className="room-info-item flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <Users size={17} />
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            Members
                                        </p>

                                        <p className="mt-1 font-bold text-slate-700">
                                            {room.member_count ||
                                                0}{" "}
                                            students
                                        </p>
                                    </div>
                                </div>

                                <div className="room-info-item flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                                        <Users size={17} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            Created By
                                        </p>

                                        <p className="mt-1 truncate font-bold text-slate-700">
                                            {room.created_by_name ||
                                                "Student"}
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-4">
                                    {isMember ? (
                                        <div className="room-member-success flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                                            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />

                                            <div>
                                                <p className="text-xs font-black text-emerald-700">
                                                    You are a member
                                                </p>

                                                <p className="mt-0.5 text-[10px] text-emerald-600">
                                                    You can participate in this discussion.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="room-member-readonly flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                                            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-slate-400" />

                                            <div>
                                                <p className="text-xs font-black text-slate-600">
                                                    Read only
                                                </p>

                                                <p className="mt-0.5 text-[10px] text-slate-400">
                                                    Join the room to participate.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Study Together */}

                        <div
                            
                            className="room-study-together relative overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-500 p-6 text-white shadow-lg shadow-blue-500/15"
                        >
                            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />

                            <div className="pointer-events-none absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-white/10" />

                            <div className="relative">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                                    <Users size={23} />
                                </div>

                                <h3 className="mt-5 text-xl font-black">
                                    Study Together
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-blue-50">
                                    Ask questions, help classmates and share useful academic resources.
                                </p>

                                <div className="mt-5 flex items-center gap-2 text-xs font-bold text-white/90">
                                    <MessageSquare size={15} />

                                    <span>
                                        Keep the discussion academic and helpful.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default RoomDetails;