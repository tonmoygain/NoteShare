import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";

import {
    MessageSquare,
    Users,
    Plus,
    ArrowRight,
    Search,
    Clock,
    Hash,
    Loader2,
    X,
    Sparkles,
    FolderOpen,
    ShieldCheck,
} from "lucide-react";

function Rooms() {
    const navigate = useNavigate();

    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [showCreateRoom, setShowCreateRoom] =
        useState(false);

    const [creatingRoom, setCreatingRoom] =
        useState(false);

    const [parentRooms, setParentRooms] = useState([]);

    const [roomForm, setRoomForm] = useState({
        name: "",
        description: "",
        category: "",
        department: "",
        parent_room: "",
    });

    useEffect(() => {
        loadRooms();
    }, []);

    const createRoom = async (e) => {
        e.preventDefault();

        if (!roomForm.name.trim()) {
            alert("Please enter a room name.");
            return;
        }

        try {
            const token = localStorage.getItem("access");

            if (!token) {
                alert(
                    "Please login first to create a room."
                );

                navigate("/login");
                return;
            }

            setCreatingRoom(true);

            const response = await API.post(
                "discussion/rooms/create/",
                {
                    name: roomForm.name.trim(),
                    description:
                        roomForm.description.trim(),
                    category:
                        roomForm.category.trim() ||
                        "General",
                    department:
                        roomForm.department.trim(),
                    parent_room: roomForm.parent_room
                        ? Number(roomForm.parent_room)
                        : null,
                }
            );

            console.log(
                "Created Room:",
                response.data
            );

            alert(
                "Discussion room created successfully."
            );

            setRoomForm({
                name: "",
                description: "",
                category: "",
                department: "",
                parent_room: "",
            });

            setShowCreateRoom(false);

            await loadRooms();
        } catch (error) {
            console.error(
                "Create Room Error:",
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

            if (error.response?.status === 401) {
                alert(
                    "Please login first to create a room."
                );

                navigate("/login");
            } else {
                alert(
                    error.response?.data?.detail ||
                        error.response?.data?.error ||
                        "Could not create the room."
                );
            }
        } finally {
            setCreatingRoom(false);
        }
    };

    const loadRooms = async () => {
        try {
            setLoading(true);

            const response = await API.get(
                "discussion/rooms/"
            );

            console.log(
                "Discussion Rooms:",
                response.data
            );

            const data = Array.isArray(response.data)
                ? response.data
                : response.data.results ||
                  response.data.rooms ||
                  [];

            setRooms(data);
            setParentRooms(data);
        } catch (error) {
            console.error(
                "Discussion Rooms API Error:",
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

            setRooms([]);
            setParentRooms([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredRooms = rooms.filter((room) => {
        const keyword = search
            .toLowerCase()
            .trim();

        if (!keyword) return true;

        return (
            (room.name || "")
                .toLowerCase()
                .includes(keyword) ||
            (room.description || "")
                .toLowerCase()
                .includes(keyword) ||
            (room.category || "")
                .toLowerCase()
                .includes(keyword)
        );
    });

    const getRoomStyle = (room) => {
        const text =
            `${room.name || ""} ${
                room.department || ""
            } ${room.category || ""}`.toLowerCase();

        if (
            text.includes("cse") ||
            text.includes("computer")
        ) {
            return {
                color: "from-blue-600 to-cyan-500",
                bg: "bg-blue-50",
                text: "text-blue-600",
            };
        }

        if (text.includes("eee")) {
            return {
                color: "from-violet-600 to-purple-500",
                bg: "bg-violet-50",
                text: "text-violet-600",
            };
        }

        if (text.includes("bba")) {
            return {
                color: "from-emerald-600 to-teal-500",
                bg: "bg-emerald-50",
                text: "text-emerald-600",
            };
        }

        if (text.includes("english")) {
            return {
                color: "from-orange-500 to-amber-400",
                bg: "bg-orange-50",
                text: "text-orange-600",
            };
        }

        return {
            color: "from-slate-600 to-slate-400",
            bg: "bg-slate-100",
            text: "text-slate-600",
        };
    };

    if (loading) {
        return (
            <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
                <div className="animate-pulse">
                    <div className="h-7 w-40 rounded-full bg-slate-200" />

                    <div className="mt-5 h-12 w-80 max-w-full rounded-2xl bg-slate-200" />

                    <div className="mt-4 h-5 w-full max-w-2xl rounded bg-slate-200" />

                    <div className="mt-8 h-14 rounded-2xl bg-slate-200" />

                    <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map(
                            (item) => (
                                <div
                                    key={item}
                                    className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6"
                                >
                                    <div className="h-1.5 rounded-full bg-slate-200" />

                                    <div className="mt-6 flex items-center justify-between">
                                        <div className="h-14 w-14 rounded-2xl bg-slate-200" />
                                        <div className="h-7 w-20 rounded-full bg-slate-200" />
                                    </div>

                                    <div className="mt-6 h-7 rounded bg-slate-200" />

                                    <div className="mt-4 h-4 rounded bg-slate-200" />
                                    <div className="mt-3 h-4 w-4/5 rounded bg-slate-200" />

                                    <div className="mt-6 h-4 w-28 rounded bg-slate-200" />

                                    <div className="mt-7 flex justify-between border-t border-slate-100 pt-5">
                                        <div className="h-4 w-28 rounded bg-slate-200" />
                                        <div className="h-11 w-11 rounded-xl bg-slate-200" />
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <>
            {/* =====================================================
                CREATE ROOM MODAL
            ====================================================== */}

            {showCreateRoom && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-md sm:items-center sm:p-4">
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 24,
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
                        className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-[30px] border border-white/70 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.18)] sm:max-h-[90vh] sm:rounded-[30px]"
                    >
                        {/* Modal Header */}

                        <div className="flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur sm:px-7">
                            <div>
                                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">
                                    <Sparkles size={12} />
                                    Community Studio
                                </div>

                                <h2 className="text-2xl font-black text-slate-800">
                                    Create Discussion Room
                                </h2>

                                <p className="mt-1 text-sm text-slate-400">
                                    Create a new community discussion room.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowCreateRoom(
                                        false
                                    )
                                }
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form */}

                        <form
                            onSubmit={createRoom}
                            className="space-y-6 p-6 sm:p-7"
                        >
                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                    Room Name
                                </label>

                                <input
                                    type="text"
                                    value={roomForm.name}
                                    onChange={(e) =>
                                        setRoomForm({
                                            ...roomForm,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="Example: Data Science Discussion"
                                    disabled={creatingRoom}
                                    className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                    Description
                                </label>

                                <textarea
                                    value={roomForm.description}
                                    onChange={(e) =>
                                        setRoomForm({
                                            ...roomForm,
                                            description:
                                                e.target
                                                    .value,
                                        })
                                    }
                                    placeholder="Describe what students can discuss here..."
                                    rows={4}
                                    disabled={creatingRoom}
                                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                                />
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-slate-700">
                                        Category
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            roomForm.category
                                        }
                                        onChange={(e) =>
                                            setRoomForm({
                                                ...roomForm,
                                                category:
                                                    e.target
                                                        .value,
                                            })
                                        }
                                        placeholder="Example: Academic"
                                        disabled={creatingRoom}
                                        className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-bold text-slate-700">
                                        Department
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            roomForm.department
                                        }
                                        onChange={(e) =>
                                            setRoomForm({
                                                ...roomForm,
                                                department:
                                                    e.target
                                                        .value,
                                            })
                                        }
                                        placeholder="Example: CSE"
                                        disabled={creatingRoom}
                                        className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                    Parent Room
                                </label>

                                <select
                                    value={
                                        roomForm.parent_room
                                    }
                                    onChange={(e) =>
                                        setRoomForm({
                                            ...roomForm,
                                            parent_room:
                                                e.target
                                                    .value,
                                        })
                                    }
                                    disabled={creatingRoom}
                                    className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                                >
                                    <option value="">
                                        No Parent Room
                                    </option>

                                    {parentRooms.map(
                                        (parent) => (
                                            <option
                                                key={
                                                    parent.id
                                                }
                                                value={
                                                    parent.id
                                                }
                                            >
                                                {parent.name}
                                            </option>
                                        )
                                    )}
                                </select>

                                <p className="mt-2 text-xs leading-5 text-slate-400">
                                    Select Study Room to create a department room inside it.
                                </p>
                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowCreateRoom(
                                            false
                                        )
                                    }
                                    className="rounded-xl bg-slate-100 px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-200"
                                >
                                    Cancel
                                </button>

                                <motion.button
                                    type="submit"
                                    disabled={
                                        creatingRoom ||
                                        !roomForm.name.trim()
                                    }
                                    whileHover={
                                        !creatingRoom
                                            ? {
                                                  y: -1,
                                              }
                                            : {}
                                    }
                                    whileTap={{
                                        scale: 0.99,
                                    }}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 font-bold text-white shadow-lg shadow-blue-500/15 transition hover:from-blue-700 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {creatingRoom ? (
                                        <>
                                            <Loader2
                                                size={18}
                                                className="animate-spin"
                                            />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={18} />
                                            Create Room
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* =====================================================
                PAGE
            ====================================================== */}

            <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">

                {/* =================================================
                    HEADER
                ================================================== */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 16,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.5,
                    }}
                    className="mb-9 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
                >
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">
                            <MessageSquare size={15} />
                            Student Community
                        </div>

                        <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-800 sm:text-5xl">
                            Discussion Rooms
                        </h1>

                        <p className="mt-3 max-w-2xl text-base leading-8 text-slate-500 sm:text-lg">
                            Join academic discussions, ask questions and connect with other students.
                        </p>

                        <div className="mt-5 flex flex-wrap gap-3">
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500 shadow-sm">
                                <Users size={14} />
                                {rooms.length} Community Spaces
                            </div>

                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500 shadow-sm">
                                <ShieldCheck size={14} />
                                Student-led discussions
                            </div>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{
                            y: -2,
                        }}
                        whileTap={{
                            scale: 0.98,
                        }}
                        onClick={() =>
                            setShowCreateRoom(true)
                        }
                        className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-7 py-4 font-bold text-white shadow-lg shadow-blue-500/15 transition hover:from-blue-700 hover:to-cyan-600 hover:shadow-xl sm:w-auto"
                    >
                        <Plus size={20} />
                        Create Room
                        <ArrowRight
                            size={17}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                    </motion.button>
                </motion.div>

                {/* =================================================
                    SEARCH
                ================================================== */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 10,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.45,
                        delay: 0.08,
                    }}
                    className="mb-10 rounded-[26px] border border-slate-200/80 bg-white/85 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.045)] backdrop-blur-sm sm:p-5"
                >
                    <div className="relative">
                        <Search
                            size={20}
                            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            placeholder="Search discussion rooms..."
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-12 pr-5 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        />
                    </div>
                </motion.div>

                {/* =================================================
                    ROOM HEADER
                ================================================== */}

                <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-600">
                            Community Spaces
                        </p>

                        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">
                            Explore Rooms
                        </h2>
                    </div>

                    <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-500 shadow-sm">
                        {filteredRooms.length} Rooms
                    </div>
                </div>

                {/* =================================================
                    EMPTY STATE
                ================================================== */}

                {filteredRooms.length === 0 ? (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 14,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        className="rounded-[30px] border border-slate-200/80 bg-white p-10 text-center shadow-[0_15px_40px_rgba(15,23,42,0.05)] sm:p-16"
                    >
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600">
                            <MessageSquare size={36} />
                        </div>

                        <h3 className="mt-6 text-2xl font-black text-slate-800">
                            {search
                                ? "No Discussion Rooms Found"
                                : "No Discussion Rooms Yet"}
                        </h3>

                        <p className="mt-3 text-slate-500">
                            {search
                                ? "Try another search keyword."
                                : "Create the first discussion room for the community."}
                        </p>

                        {!search && (
                            <button
                                onClick={() =>
                                    setShowCreateRoom(
                                        true
                                    )
                                }
                                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                            >
                                <Plus size={18} />
                                Create First Room
                            </button>
                        )}
                    </motion.div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {filteredRooms.map(
                            (room, index) => {
                                const style =
                                    getRoomStyle(
                                        room
                                    );

                                return (
                                    <motion.div
                                        key={room.id}
                                        initial={{
                                            opacity: 0,
                                            y: 18,
                                        }}
                                        whileInView={{
                                            opacity: 1,
                                            y: 0,
                                        }}
                                        viewport={{
                                            once: true,
                                            amount: 0.12,
                                        }}
                                        transition={{
                                            duration: 0.45,
                                            delay:
                                                (index %
                                                    3) *
                                                0.05,
                                        }}
                                        whileHover={{
                                            y: -7,
                                        }}
                                        className="group relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.045)] transition-shadow duration-300 hover:shadow-[0_25px_55px_rgba(15,23,42,0.10)]"
                                    >
                                        <div
                                            className={`h-1.5 bg-gradient-to-r ${style.color}`}
                                        />

                                        {/* Soft glow */}

                                        <div
                                            className={`pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br ${style.bg} opacity-80 blur-2xl transition-transform duration-700 group-hover:scale-150`}
                                        />

                                        <div className="relative p-6 sm:p-7">

                                            <div className="flex items-start justify-between gap-4">
                                                <motion.div
                                                    whileHover={{
                                                        rotate: -3,
                                                        scale: 1.04,
                                                    }}
                                                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${style.bg} ${style.text}`}
                                                >
                                                    <MessageSquare size={25} />
                                                </motion.div>

                                                <span
                                                    className={`rounded-full ${style.bg} px-3 py-1.5 text-xs font-bold ${style.text}`}
                                                >
                                                    {room.category ||
                                                        "Discussion"}
                                                </span>
                                            </div>

                                            <h2 className="mt-6 line-clamp-2 text-2xl font-black tracking-tight text-slate-800 transition-colors duration-300 group-hover:text-blue-600">
                                                {room.name}
                                            </h2>

                                            <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-500">
                                                {room.description ||
                                                    "Join this discussion room and connect with other students."}
                                            </p>

                                            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-500">
                                                <Users size={17} />

                                                <span>
                                                    {room.members_count ??
                                                        room.members ??
                                                        0}{" "}
                                                    students
                                                </span>
                                            </div>

                                            <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5">
                                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                                                    <Clock size={14} />
                                                    Active discussion
                                                </div>

                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            `/rooms/${room.id}`
                                                        )
                                                    }
                                                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/20"
                                                    title="Open room"
                                                >
                                                    <ArrowRight size={19} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            }
                        )}
                    </div>
                )}

                {/* =================================================
                    COMMUNITY INFO
                ================================================== */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 18,
                    }}
                    whileInView={{
                        opacity: 1,
                        y: 0,
                    }}
                    viewport={{
                        once: true,
                        amount: 0.12,
                    }}
                    className="relative mt-12 overflow-hidden rounded-[30px] bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-7 text-white shadow-[0_20px_55px_rgba(15,23,42,0.12)] sm:p-9"
                >
                    <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

                    <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />

                    <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <Hash size={22} />

                                <h2 className="text-2xl font-black">
                                    Build the NoteShare Community
                                </h2>
                            </div>

                            <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                                Ask questions, exchange ideas and help other students learn together.
                            </p>
                        </div>

                        <div className="inline-flex shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 backdrop-blur-sm">
                            <Users size={20} />

                            <span className="font-semibold">
                                Student Community
                            </span>
                        </div>
                    </div>
                </motion.div>
            </section>
        </>
    );
}

export default Rooms;