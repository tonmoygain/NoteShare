import { useEffect, useState, useRef } from "react";
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
        localStorage.getItem("username") || "Student";

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

            /*
             * Child rooms are already returned
             * from discussion_room_detail API.
             */

            setChildRooms(
                roomData.child_rooms || []
            );


            /*
             * Load discussion messages
             */

            const messageResponse = await API.get(
                `discussion/rooms/${id}/messages/`
            );

            setMessages(
                Array.isArray(messageResponse.data)
                    ? messageResponse.data
                    : []
            );

            // ==========================
            // IMPORTANT
            // ==========================
            // Do NOT set isMember(false)
            // here.
            //
            // Join / Leave functions
            // will control this state.

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

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        if (!id) return;

        const interval = setInterval(async () => {

            try {

                const response = await API.get(
                    `discussion/rooms/${id}/messages/`
                );

                const data = Array.isArray(response.data)
                    ? response.data
                    : [];
                setMessages(data);

            } catch (error) {

                console.error(
                    "Message refresh error:",
                    error
                );
            }
        }, 3000);

        return () => clearInterval(interval);

    }, [id]);

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    }, [messages]);

    const joinRoom = async () => {

        try {

            const token = localStorage.getItem("access");

            if (!token) {
                alert("Please login first to join this room.");
                navigate("/login");
                return;
            }

            setJoining(true);

            console.log("Joining room:", id);

            const response = await API.post(
                `discussion/rooms/${id}/join/`
            );

            console.log(
                "Join response:",
                response.data
            );

            setIsMember(true);

            setRoom((prev) => {

                if (!prev) return prev;

                return {
                    ...prev,
                    member_count:
                        response.data.member_count ??
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

            console.log(
                "STATUS:",
                error.response?.status
            );

            console.log(
                "DATA:",
                error.response?.data
            );

            if (error.response?.status === 401) {

                alert(
                    "Please login first to join this room."
                );

                navigate("/login");

            } else {

                alert(

                    error.response?.data?.detail ||
                    error.response?.data?.error ||
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

            alert("You left the discussion room.");

            await loadRoom();

        } catch (error) {

            console.error(
                "Leave Room Error:",
                error
            );

            if (error.response?.status === 401) {

                alert(
                    "Please login first."
                );

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

            if (error.response?.status === 401) {

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


    if (loading) {

        return (

            <div className="flex justify-center items-center min-h-[70vh]">

                <div className="text-center">

                    <Loader2
                        size={38}
                        className="animate-spin mx-auto text-blue-600"
                    />

                    <p className="mt-4 text-slate-500 font-semibold">
                        Loading Discussion Room...
                    </p>

                </div>

            </div>

        );

    }


    if (!room) {

        return (

            <div className="max-w-4xl mx-auto px-8 py-12 text-center">

                <h2 className="text-2xl font-black text-slate-800">
                    Room Not Found
                </h2>

                <button
                    onClick={() => navigate("/rooms")}
                    className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold"
                >
                    Back to Discussion
                </button>

            </div>

        );

    }

    const isParentRoom =
        !room.parent_room;

    return (

        <section className="max-w-7xl mx-auto px-8 py-10">

            {/* Back */}

            <button
                onClick={() =>
                    isParentRoom
                        ? navigate("/rooms")
                        : navigate(
                            `/rooms/${room.parent_room}`
                        )
                }
                className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold transition"
            >

                <ArrowLeft size={18} />

                {isParentRoom
                    ? "Back to Discussion Rooms"
                    : "Back to Study Room"}

            </button>


            {/* Room Header */}

            <div className="mt-7 relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-900 p-8 md:p-10 text-white shadow-xl">

                <div className="absolute -right-20 -top-20 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl"></div>

                <div className="relative">

                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 px-4 py-2 rounded-full text-sm font-bold">

                        <MessageSquare size={16} />

                        {room.category || "Discussion"}

                    </div>


                    <h1 className="text-4xl md:text-5xl font-black mt-5">

                        {room.name}

                    </h1>


                    <p className="text-blue-100 mt-4 max-w-2xl text-lg leading-8">

                        {room.description}

                    </p>


                    <div className="flex flex-wrap items-center gap-5 mt-6">

                        <div className="flex items-center gap-2 text-blue-100">

                            <Users size={18} />

                            {room.member_count || 0} students

                        </div>


                        {room.department && (

                            <div className="flex items-center gap-2 text-blue-100">

                                <Hash size={18} />

                                {room.department}

                            </div>

                        )}

                    </div>


                    {/* Join / Leave */}

                    {!isParentRoom && (

                        <div className="mt-7">

                            {isMember ? (

                                <button
                                    onClick={leaveRoom}
                                    disabled={joining}
                                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-red-500/20 border border-white/20 text-white px-6 py-3 rounded-xl font-bold transition disabled:opacity-50"
                                >

                                    <LogOut size={18} />

                                    {joining
                                        ? "Leaving..."
                                        : "Leave Room"}

                                </button>

                            ) : (

                                <button
                                    onClick={joinRoom}
                                    disabled={joining}
                                    className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-xl font-black transition disabled:opacity-50"
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
                                            <LogIn size={18} />
                                            Join Room
                                        </>
                                    )}

                                </button>

                            )}

                        </div>

                    )}

                </div>

            </div>


            {/* =====================================================
                PARENT ROOM
            ====================================================== */}

            {isParentRoom ? (

                <div className="mt-12">

                    <div className="flex items-center gap-3">

                        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">

                            <Hash size={21} />

                        </div>

                        <div>

                            <h2 className="text-2xl font-black text-slate-800">

                                Department Rooms

                            </h2>

                            <p className="text-slate-500 text-sm mt-1">

                                Choose a department to join its discussion.

                            </p>

                        </div>

                    </div>


                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-7">

                        {childRooms.map((child) => (

                            <div
                                key={child.id}
                                onClick={() =>
                                    navigate(
                                        `/rooms/${child.id}`
                                    )
                                }
                                className="group bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
                            >

                                <div className="flex items-start justify-between">

                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">

                                        <MessageSquare size={23} />

                                    </div>

                                    <ArrowRight
                                        size={20}
                                        className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition"
                                    />

                                </div>


                                <h3 className="text-xl font-black text-slate-800 mt-5 group-hover:text-blue-600 transition">

                                    {child.name}

                                </h3>


                                <p className="text-slate-500 text-sm leading-6 mt-2 line-clamp-3">

                                    {child.description}

                                </p>


                                <div className="flex items-center gap-2 mt-5 text-sm text-slate-400">

                                    <Users size={16} />

                                    {child.member_count || 0} students

                                </div>

                            </div>

                        ))}

                    </div>

                </div>

            ) : (

                /* =====================================================
                   DEPARTMENT DISCUSSION
                ====================================================== */

                <div className="mt-10 grid lg:grid-cols-[1fr_320px] gap-7">

                    {/* Messages */}

                    <div className="bg-white border border-slate-100 rounded-[30px] shadow-lg overflow-hidden">

                        {/* Chat Header */}

                        <div className="px-6 py-5 border-b border-slate-100 bg-white">

                            <div className="flex items-center justify-between gap-4">

                                <div className="flex items-center gap-3 min-w-0">

                                    <div className="w-11 h-11 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">

                                        <MessageSquare size={21} />

                                    </div>

                                    <div className="min-w-0">

                                        <h2 className="font-black text-slate-800 text-xl truncate">

                                            {room.department || room.name} Discussion

                                        </h2>

                                        <p className="text-xs text-slate-400 mt-1">

                                            Ask questions and share ideas with other students.

                                        </p>

                                    </div>

                                </div>

                                {/* Membership Status */}

                                {isMember ? (

                                    <div className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">

                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>

                                        Joined

                                    </div>

                                ) : (

                                    <div className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">

                                        <span className="w-2 h-2 rounded-full bg-slate-400"></span>

                                        Read Only

                                    </div>

                                )}

                            </div>

                        </div>

                        {/* Message List */}

                        <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-slate-50/60">

                            {messages.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-center">
                                    <div className="max-w-sm">
                                        <div className="w-16 h-16 mx-auto rounded-2xl bg-white text-blue-500 flex items-center justify-center shadow-sm border border-slate-100">
                                            <MessageSquare size={28} />
                                        </div>
                                        <h3 className="font-black text-slate-700 mt-4">
                                            No messages yet
                                        </h3>

                                        <p className="text-sm text-slate-400 mt-1 leading-6">
                                            {isMember
                                                ? "Be the first student to start the discussion."
                                                : "Join this room to start participating in the discussion."
                                            }
                                        </p>

                                    </div>
                                    
                                </div>

                            ) : (

                                 messages.map((item) => {

                                    const ownMessage =
                                        item.username === username;
                                    return (
                                        <div
                                            key={item.id}
                                            className={`flex ${
                                                ownMessage
                                                    ? "justify-end"
                                                    : "justify-start"
                                            }`}
                                        >
                                            <div
                                                className={`max-w-[75%] min-w-[120px] rounded-2xl px-5 py-3 shadow-sm ${
                                                    ownMessage
                                                        ? "bg-blue-600 text-white rounded-br-md"
                                                        : "bg-white text-slate-700 border border-slate-100 rounded-bl-md"
                                                }`}
                                            >
                                                <p
                                                    className={`text-xs font-bold mb-1 ${
                                                        ownMessage
                                                            ? "text-blue-100"
                                                            : "text-blue-600"
                                                    }`}
                                                >
                                                    {item.username || "Student"}
                                                </p>

                                                <p className="leading-6 break-words whitespace-pre-wrap">
                                                    {item.message}
                                                </p>

                                                <div
                                                    className={`text-[10px] mt-2 ${
                                                        ownMessage
                                                            ? "text-blue-100 text-right"
                                                            : "text-slate-400 text-left"
                                                    }`}
                                                >
                                                    {new Date(
                                                        item.created_at
                                                    ).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}

                                                </div>

                                            </div>

                                        </div>

                                    );

                                })

                            )}

                            <div ref={messagesEndRef} />

                        </div>

                        {/* Message Input */}

                        <form
                            onSubmit={sendMessage}
                            className="p-5 border-t border-slate-100 bg-white"
                        >

                            {!isMember && (

                                <div className="mb-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-xs font-semibold">

                                    Join this room to participate in the discussion.

                                </div>

                            )}

                            <div className="flex gap-3">

                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) =>
                                        setMessage(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (
                                            e.key === "Enter" &&
                                            !e.shiftKey
                                        ) {
                                            e.preventDefault();
                                            if (
                                                isMember &&
                                                !sending &&
                                                message.trim()
                                            ) {
                                                sendMessage(e);
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
                                    className="flex-1 h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                />

                                <button
                                    type="submit"
                                    disabled={
                                        !isMember ||
                                        sending ||
                                        !message.trim()
                                    }
                                    className="w-12 h-12 shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {sending ? (

                                        <Loader2
                                            size={19}
                                            className="animate-spin"
                                        />

                                    ) : (

                                        <Send size={19} />

                                    )}

                                </button>
                            
                            </div>

                            {isMember && (

                                <p className="text-[11px] text-slate-400 mt-2 px-1">
                                    Press Enter to send your message.
                                </p>

                            )}

                        </form>

                    </div>


                    {/* Sidebar */}

                    <div className="space-y-5">

                        {/* Room Information */}

                        <div className="bg-white border border-slate-100 rounded-[28px] shadow-sm overflow-hidden">

                            <div className="px-6 py-5 border-b border-slate-100">

                                <div className="flex items-center gap-3">

                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">

                                        <Hash size={19} />

                                    </div>

                                    <div>

                                        <h3 className="font-black text-slate-800">

                                            Room Information

                                        </h3>

                                        <p className="text-xs text-slate-400 mt-1">

                                            Details about this discussion room.

                                        </p>

                                    </div>

                                </div>

                            </div>

                            <div className="p-6 space-y-5">

                                {/* Department */}

                                <div className="flex items-center gap-3">

                                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">

                                        <Hash size={17} />

                                    </div>

                                    <div className="min-w-0">

                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-black">

                                            Department

                                        </p>

                                        <p className="font-bold text-slate-700 mt-1 truncate">

                                            {room.department || "General"}

                                        </p>

                                    </div>

                                </div>

                                {/* Members */}

                                <div className="flex items-center gap-3">

                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">

                                        <Users size={17} />

                                    </div>

                                    <div>

                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-black">

                                            Members

                                        </p>

                                        <p className="font-bold text-slate-700 mt-1">

                                            {room.member_count || 0} students

                                        </p>

                                    </div>

                                </div>

                                {/* Created By */}

                                <div className="flex items-center gap-3">

                                    <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">

                                        <Users size={17} />

                                    </div>

                                    <div className="min-w-0">

                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-black">

                                            Created By

                                        </p>

                                        <p className="font-bold text-slate-700 mt-1 truncate">

                                            {room.created_by_name || "Student"}

                                        </p>

                                    </div>

                                </div>

                                {/* Status */}

                                <div className="pt-4 border-t border-slate-100">

                                    {isMember ? (

                                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">

                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>

                                            <div>

                                                <p className="text-xs font-black text-emerald-700">

                                                    You are a member

                                                </p>

                                                <p className="text-[10px] text-emerald-600 mt-0.5">

                                                    You can participate in this discussion.

                                                </p>
                                                
                                            </div>
 
                                        </div>

                                    ) : (

                                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">

                                            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0"></span>

                                            <div>

                                                <p className="text-xs font-black text-slate-600">

                                                    Read only

                                                </p>

                                                <p className="text-[10px] text-slate-400 mt-0.5">

                                                    Join the room to participate.

                                                </p>

                                            </div>

                                        </div>

                                    )}

                                </div>

                            </div>

                        </div>

                        {/* Study Together */}

                        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-500 rounded-[28px] p-6 text-white shadow-lg">

                            <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/10"></div>

                            <div className="absolute -right-12 -bottom-12 w-32 h-32 rounded-full bg-white/10"></div>

                            <div className="relative">

                                <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
                                    
                                    <Users size={23} />

                                </div>

                                <h3 className="font-black text-xl mt-5">

                                    Study Together

                                </h3>

                                <p className="text-blue-50 text-sm leading-6 mt-2">

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