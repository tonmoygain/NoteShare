import { useEffect, useState } from "react";
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
} from "lucide-react";

function Rooms() {

const navigate = useNavigate();

const [rooms, setRooms] = useState([]);
const [loading, setLoading] = useState(true);
const [search, setSearch] = useState("");

const [showCreateRoom, setShowCreateRoom] = useState(false);

const [creatingRoom, setCreatingRoom] = useState(false);

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
                    roomForm.category.trim() || "General",
                department: 
                    roomForm.department.trim(),

                parent_room:
                    roomForm.parent_room
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

        const response = await API.get("discussion/rooms/");

        console.log("Discussion Rooms:", response.data);

        const data = Array.isArray(response.data)
            ? response.data
            : response.data.results || response.data.rooms || [];

        setRooms(data);

        setParentRooms(data);

    } catch (error) {

        console.error("Discussion Rooms API Error:", error);

        console.log("STATUS:", error.response?.status);

        console.log("DATA:", error.response?.data);

    } finally {

        setLoading(false);

    }

};


const filteredRooms = rooms.filter((room) => {

    const keyword = search.toLowerCase().trim();

    if (!keyword) return true;

    return (
        (room.name || "").toLowerCase().includes(keyword) ||
        (room.description || "").toLowerCase().includes(keyword) ||
        (room.category || "").toLowerCase().includes(keyword)
    );

});


const getRoomStyle = (room) => {

    const text = `${room.name || ""} ${room.department || ""} ${room.category || ""}`.toLowerCase();

    if (text.includes("cse") || text.includes("computer")) {
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

        <section className="max-w-7xl mx-auto px-8 py-12">

            <div className="flex justify-center items-center min-h-[60vh]">

                <div className="text-center">

                    <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">

                        <Loader2
                            size={30}
                            className="animate-spin"
                        />

                    </div>

                    <h2 className="text-xl font-black text-slate-800 mt-5">

                        Loading Discussion Rooms...

                    </h2>

                    <p className="text-slate-400 mt-2">

                        Please wait a moment.

                    </p>

                </div>

            </div>

        </section>

    );

}


return (
    <>
    {showCreateRoom && (

        <div className="  fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-5">

            <div className="w-full max-w-2xl bg-white rounded-[30px] shadow-2xl overflow-hidden">
            
                {/* Modal Header */}
                <div className="flex items-center justify-between px-7 py-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800">
                            Create Discussion Room
                        </h2>

                        <p className="text-sm text-slate-400 mt-1">
                            Create a new community discussion room.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setShowCreateRoom(false)
                        }

                        className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition">
                            <X size={20} />
                    </button>
                </div>

                {/* Form */}

                <form
                    onSubmit={createRoom}
                    className="p-7 space-y-5"
                >
                    {/* Name */}

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
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
                            className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                        />
                    </div>

                    {/* Description */}

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Description
                        </label>

                        <textarea
                            value={roomForm.description}
                            onChange={(e) =>
                                setRoomForm({
                                    ...roomForm,
                                    description:
                                        e.target.value,
                                })
                            }
                            placeholder="Describe what students can discuss here..."
                            rows={4}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none resize-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                        />
                    </div>

                    {/* Category + Department */}

                    <div className="grid md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Category
                            </label>

                            <input
                                type="text"
                                value={roomForm.category}
                                onChange={(e) =>
                                    setRoomForm({
                                        ...roomForm,
                                        category:
                                            e.target.value,
                                    })
                                }

                                placeholder="Example: Academic"
                                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Department
                            </label>

                            <input
                                type="text"
                                value={roomForm.department}
                                onChange={(e) =>
                                    setRoomForm({
                                        ...roomForm,
                                        department:
                                            e.target.value,
                                    })
                                }
                                placeholder="Example: CSE"
                                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                            />
                        </div>
                    </div>

                    {/* Parent Room */}

                    <div>

                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Parent Room
                        </label>

                        <select
                            value={roomForm.parent_room}
                            onChange={(e) =>
                                setRoomForm({
                                    ...roomForm,
                                    parent_room: e.target.value,
                                })
                            }
                            className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-700 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                        >
                            <option value="">
                                No Parent Room
                            </option>

                            {parentRooms.map((parent) => (

                                <option
                                    key={parent.id}
                                    value={parent.id}
                                >
                                    {parent.name}
                                </option>

                            ))}
                        </select>

                        <p className="text-xs text-slate-400 mt-2">
                            Select Study Room to create a department room inside it.
                        </p>

                    </div>

                    {/* Buttons */}

                    <div className="flex justify-end gap-3 pt-3">
                        <button
                            type="button"
                            onClick={() =>
                                setShowCreateRoom(false)
                            }
                            className="px-5 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                creatingRoom ||
                                !roomForm.name.trim()
                            }
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold flex items-center gap-2 hover:from-blue-700 hover:to-cyan-600 transition disabled:opacity-50"
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
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )}
    

    <section className="max-w-7xl mx-auto px-8 py-10">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">

            <div>

                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold border border-blue-100">

                    <MessageSquare size={15} />

                    Student Community

                </div>

                <h1 className="text-4xl md:text-5xl font-black text-slate-800 mt-5 tracking-tight">

                    Discussion Rooms

                </h1>

                <p className="text-slate-500 mt-3 text-lg max-w-2xl leading-8">

                    Join academic discussions, ask questions and connect with other students.

                </p>

            </div>


            <button
                onClick={() => setShowCreateRoom(true)}
                className="
                    group
                    inline-flex
                    items-center
                    justify-center
                    gap-3
                    bg-gradient-to-r
                    from-blue-600
                    to-cyan-500
                    hover:from-blue-700
                    hover:to-cyan-600
                    text-white
                    px-7
                    py-4
                    rounded-2xl
                    font-bold
                    shadow-lg
                    hover:shadow-blue-200
                    hover:-translate-y-1
                    transition-all
                    duration-300
                "
            >

                <Plus size={20} />

                Create Room

            </button>

        </div>


        {/* =====================================================
            SEARCH
        ====================================================== */}

        <div className="bg-white border border-slate-100 rounded-3xl shadow-lg p-5 mb-10">

            <div className="relative">

                <Search
                    size={20}
                    className="
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                    "
                />

                <input
                    type="text"
                    placeholder="Search discussion rooms..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="
                        w-full
                        bg-slate-50
                        border
                        border-slate-200
                        rounded-2xl
                        pl-12
                        pr-5
                        py-4
                        text-slate-700
                        outline-none
                        focus:ring-4
                        focus:ring-blue-100
                        focus:border-blue-400
                        focus:bg-white
                        transition
                    "
                />

            </div>

        </div>


        {/* =====================================================
            ROOM COUNT
        ====================================================== */}

        <div className="flex items-center justify-between mb-6">

            <div>

                <p className="text-sm font-bold text-blue-600 uppercase tracking-wider">

                    Community Spaces

                </p>

                <h2 className="text-2xl font-black text-slate-800 mt-1">

                    Explore Rooms

                </h2>

            </div>

            <div className="bg-slate-100 px-4 py-2 rounded-xl text-sm font-bold text-slate-600">

                {filteredRooms.length} Rooms

            </div>

        </div>


        {/* =====================================================
            ROOMS
        ====================================================== */}

        {filteredRooms.length === 0 ? (

            <div className="bg-white border border-slate-200 rounded-[30px] p-16 text-center shadow-sm">

                <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center">

                    <MessageSquare size={36} />

                </div>

                <h3 className="text-2xl font-black text-slate-800 mt-6">

                    No Discussion Rooms Found

                </h3>

                <p className="text-slate-500 mt-3">

                    Try another search keyword.

                </p>

            </div>

        ) : (

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-7">

                {filteredRooms.map((room) => {

                    const style = getRoomStyle(room);

                    return (

                        <div
                            key={room.id}
                            className="
                                group
                                relative
                                bg-white
                                rounded-[28px]
                                border
                                border-slate-100
                                shadow-lg
                                hover:shadow-2xl
                                hover:-translate-y-2
                                transition-all
                                duration-500
                                overflow-hidden
                            "
                        >

                            {/* Top Gradient */}

                            <div
                                className={`h-2 bg-gradient-to-r ${style.color}`}
                            />


                            <div className="p-7">

                                {/* Icon + Category */}

                                <div className="flex items-start justify-between gap-4">

                                    <div
                                        className={`
                                            w-14
                                            h-14
                                            rounded-2xl
                                            ${style.bg}
                                            ${style.text}
                                            flex
                                            items-center
                                            justify-center
                                            group-hover:scale-110
                                            transition-transform
                                            duration-300
                                        `}
                                    >

                                        <MessageSquare size={25} />

                                    </div>


                                    <span
                                        className={`
                                            text-xs
                                            font-bold
                                            ${style.bg}
                                            ${style.text}
                                            px-3
                                            py-1.5
                                            rounded-full
                                        `}
                                    >
                                            {room.category || "Discussion"}

                                    </span>

                                </div>

                                {/* Title */}

                                <h2 className="
                                    text-2xl
                                    font-black
                                    text-slate-800
                                    mt-6
                                    group-hover:text-blue-600
                                    transition
                                ">

                                    {room.name}

                                </h2>


                                {/* Description */}

                                <p className="
                                    text-slate-500
                                    mt-3
                                    leading-7
                                    line-clamp-3
                                ">

                                    {room.description ||
                                        "Join this discussion room and connect with other students."}

                                </p>


                                {/* Members */}

                                <div className="
                                    flex
                                    items-center
                                    gap-2
                                    mt-6
                                    text-sm
                                    text-slate-500
                                ">

                                    <Users size={17} />

                                    <span>

                                        {room.members_count ??
                                            room.members ??
                                            0} students

                                    </span>

                                </div>


                                {/* Bottom */}

                                <div className="
                                    flex
                                    items-center
                                    justify-between
                                    mt-7
                                    pt-5
                                    border-t
                                    border-slate-100
                                ">

                                    <div className="
                                        flex
                                        items-center
                                        gap-2
                                        text-xs
                                        text-slate-400
                                    ">

                                        <Clock size={14} />

                                        Active discussion

                                    </div>


                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/rooms/${room.id}`
                                            )
                                        }
                                        className="
                                            w-11
                                            h-11
                                            rounded-xl
                                            bg-slate-100
                                            text-slate-600
                                            flex
                                            items-center
                                            justify-center
                                            group-hover:bg-blue-600
                                            group-hover:text-white
                                            transition-all
                                            duration-300
                                        "
                                    >

                                        <ArrowRight size={19} />

                                    </button>

                                </div>

                            </div>

                        </div>

                    );

                })}

            </div>

        )}


        {/* =====================================================
            COMMUNITY INFO
        ====================================================== */}

        <div className="
            mt-12
            bg-gradient-to-r
            from-slate-900
            via-blue-900
            to-slate-900
            rounded-[30px]
            p-8
            md:p-10
            text-white
            relative
            overflow-hidden
        ">

            <div className="
                absolute
                -right-20
                -top-20
                w-64
                h-64
                bg-blue-500/20
                rounded-full
                blur-3xl
            " />

            <div className="
                relative
                flex
                flex-col
                md:flex-row
                md:items-center
                justify-between
                gap-6
            ">

                <div>

                    <div className="flex items-center gap-3">

                        <Hash size={22} />

                        <h2 className="text-2xl font-black">

                            Build the NoteShare Community

                        </h2>

                    </div>

                    <p className="text-slate-300 mt-3 max-w-2xl leading-7">

                        Ask questions, exchange ideas and help other students learn together.

                    </p>

                </div>


                <div className="
                    flex
                    items-center
                    gap-3
                    bg-white/10
                    px-5
                    py-3
                    rounded-2xl
                    border
                    border-white/10
                ">

                    <Users size={20} />

                    <span className="font-semibold">

                        Student Community

                    </span>

                </div>

            </div>

        </div>

    </section>
    
    </>

);

}

export default Rooms;