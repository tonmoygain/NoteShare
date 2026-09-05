import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import Toast from "../components/Toast";

import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    UserPlus,
    Loader2,
    CheckCircle2,
    ShieldCheck,
    ArrowRight,
    Sparkles,
    BookOpen,
} from "lucide-react";

import API from "../services/api";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [toast, setToast] = useState(null);

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const handleChange = (e) => {
        setError("");

        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleGoogleLogin = () => {
        window.location.href =
            "https://noteshare-uy4z.onrender.com/accounts/google/login/";
    };

    const handleFacebookLogin = () => {
        window.location.href =
            "https://noteshare-uy4z.onrender.com/accounts/facebook/login/";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        setError("");

        const username = formData.username.trim();
        const email = formData.email.trim();
        const password = formData.password;
        const confirmPassword = formData.confirmPassword;

        if (!username) {
            setError(
                "Please enter a username."
            );
            return;
        }

        if (username.length < 3) {
            setError(
                "Username must be at least 3 characters."
            );
            return;
        }

        if (!email) {
            setError(
                "Please enter your email address."
            );
            return;
        }

        if (password.length < 6) {
            setError(
                "Password must be at least 6 characters."
            );
            return;
        }

        if (password !== confirmPassword) {
            setError(
                "Passwords do not match."
            );
            return;
        }

        try {
            setLoading(true);

            await API.post(
                "register/",
                {
                    username,
                    email,
                    password,
                }
            );
 
            setToast({
                type: "success",
                message: "Registration successful. Please login.",
            });


            setTimeout(() => {
                navigate("/login");
            }, 1000);

        } catch (error) {
            console.error(
                "Registration Error:",
                error
            );

            const data =
                error.response?.data;

            if (data?.username) {
                setError(
                    Array.isArray(data.username)
                        ? data.username[0]
                        : data.username
                );
            } else if (data?.email) {
                setError(
                    Array.isArray(data.email)
                        ? data.email[0]
                        : data.email
                );
            } else if (data?.password) {
                setError(
                    Array.isArray(data.password)
                        ? data.password[0]
                        : data.password
                );
            } else {
                setError(
                    data?.error ||
                        data?.detail ||
                        "Registration failed. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-900 px-4 py-8 sm:px-6">
            
            <Toast
                toast={toast}
                onClose={() => setToast(null)}
            />
            
            {/* =====================================================
                BACKGROUND
            ====================================================== */}

            <div className="pointer-events-none absolute inset-0 overflow-hidden">

                <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

                <div className="absolute -bottom-32 -right-20 h-[28rem] w-[28rem] rounded-full bg-cyan-400/15 blur-3xl" />

                <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage:
                            "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
                        backgroundSize: "28px 28px",
                    }}
                />
            </div>

            {/* =====================================================
                MAIN CONTAINER
            ====================================================== */}

            <motion.div
                initial={{
                    opacity: 0,
                    y: 18,
                    scale: 0.98,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                }}
                transition={{
                    duration: 0.55,
                    ease: "easeOut",
                }}
                className="
                    relative
                    grid
                    w-full
                    max-w-5xl
                    overflow-hidden
                    rounded-[34px]
                    border
                    border-white/10
                    bg-white/10
                    shadow-[0_30px_100px_rgba(2,6,23,0.35)]
                    backdrop-blur-2xl
                    lg:grid-cols-[0.92fr_1.08fr]
                "
            >

                {/* =================================================
                    LEFT BRAND PANEL
                ================================================== */}

                <div className="relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-12">

                    <div className="pointer-events-none absolute -right-16 top-10 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

                    <div className="relative">

                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold text-cyan-200 backdrop-blur-sm">
                            <Sparkles size={14} />
                            Join NoteShare
                        </div>

                        <div className="mt-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-xl backdrop-blur-sm">
                            <BookOpen size={30} />
                        </div>

                        <h2 className="mt-7 max-w-md text-4xl font-black leading-tight tracking-tight xl:text-5xl">
                            Start building your
                            <span className="block bg-gradient-to-r from-cyan-300 to-blue-200 bg-clip-text text-transparent">
                                academic space.
                            </span>
                        </h2>

                        <p className="mt-5 max-w-md text-sm leading-7 text-slate-300 xl:text-base">
                            Create your NoteShare account and start sharing notes, writing blogs and connecting with other students.
                        </p>

                        <div className="mt-8 space-y-3">
                            {[
                                "Create your personal student profile",
                                "Share notes and academic resources",
                                "Publish blogs and join discussions",
                            ].map((item) => (
                                <div
                                    key={item}
                                    className="flex items-center gap-3 text-sm font-medium text-slate-200"
                                >
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                                        ✓
                                    </span>

                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative mt-10">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Your knowledge matters
                        </p>

                        <p className="mt-2 text-sm text-slate-400">
                            Learn. Share. Grow.
                        </p>
                    </div>
                </div>

                {/* =================================================
                    REGISTER PANEL
                ================================================== */}

                <div className="bg-white p-6 sm:p-8 lg:p-10 xl:p-12">

                    <div className="mx-auto max-w-md">

                        {/* Mobile Brand */}

                        <div className="mb-7 flex items-center gap-3 lg:hidden">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20">
                                <BookOpen size={21} />
                            </div>

                            <div>
                                <p className="text-lg font-black tracking-tight text-slate-900">
                                    NoteShare
                                </p>

                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                    Student Platform
                                </p>
                            </div>

                        </div>

                        {/* Header */}

                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">
                                <UserPlus size={12} />
                                Create Your Account
                            </div>

                            <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                                Create Account
                            </h1>

                            <p className="mt-2 leading-6 text-slate-500">
                                Join NoteShare and start sharing academic resources.
                            </p>
                        </div>

                        {/* Error */}

                        {error && (
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    y: -8,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                className="
                                    mt-6
                                    flex
                                    items-start
                                    gap-3
                                    rounded-2xl
                                    border
                                    border-red-100
                                    bg-red-50
                                    px-4
                                    py-3
                                    text-red-700
                                "
                            >
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-black">
                                    !
                                </span>

                                <p className="text-sm font-semibold leading-6">
                                    {error}
                                </p>
                            </motion.div>
                        )}

                        {/* Form */}

                        <form
                            onSubmit={handleSubmit}
                            className="mt-7 space-y-5"
                        >

                            {/* Username */}

                            <div>
                                <label className="text-sm font-bold text-slate-700">
                                    Username
                                </label>

                                <div className="group relative mt-2">
                                    <User
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600"
                                    />

                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Choose a username"
                                        autoComplete="username"
                                        disabled={loading}
                                        required
                                        className="
                                            h-13
                                            w-full
                                            rounded-xl
                                            border
                                            border-slate-200
                                            bg-slate-50/80
                                            pl-11
                                            pr-4
                                            text-slate-700
                                            outline-none
                                            transition
                                            placeholder:text-slate-400
                                            focus:border-blue-500
                                            focus:bg-white
                                            focus:ring-4
                                            focus:ring-blue-100
                                            disabled:cursor-not-allowed
                                            disabled:opacity-60
                                        "
                                    />
                                </div>
                            </div>

                            {/* Email */}

                            <div>
                                <label className="text-sm font-bold text-slate-700">
                                    Email
                                </label>

                                <div className="group relative mt-2">
                                    <Mail
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600"
                                    />

                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter your email"
                                        autoComplete="email"
                                        disabled={loading}
                                        required
                                        className="
                                            h-13
                                            w-full
                                            rounded-xl
                                            border
                                            border-slate-200
                                            bg-slate-50/80
                                            pl-11
                                            pr-4
                                            text-slate-700
                                            outline-none
                                            transition
                                            placeholder:text-slate-400
                                            focus:border-blue-500
                                            focus:bg-white
                                            focus:ring-4
                                            focus:ring-blue-100
                                            disabled:cursor-not-allowed
                                            disabled:opacity-60
                                        "
                                    />
                                </div>
                            </div>

                            {/* Password */}

                            <div>
                                <label className="text-sm font-bold text-slate-700">
                                    Password
                                </label>

                                <div className="group relative mt-2">
                                    <Lock
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600"
                                    />

                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="password"
                                        value={
                                            formData.password
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Create a password"
                                        autoComplete="new-password"
                                        disabled={loading}
                                        required
                                        className="
                                            h-13
                                            w-full
                                            rounded-xl
                                            border
                                            border-slate-200
                                            bg-slate-50/80
                                            pl-11
                                            pr-12
                                            text-slate-700
                                            outline-none
                                            transition
                                            placeholder:text-slate-400
                                            focus:border-blue-500
                                            focus:bg-white
                                            focus:ring-4
                                            focus:ring-blue-100
                                            disabled:cursor-not-allowed
                                            disabled:opacity-60
                                        "
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                (prev) =>
                                                    !prev
                                            )
                                        }
                                        disabled={loading}
                                        className="
                                            absolute
                                            right-2
                                            top-1/2
                                            flex
                                            h-9
                                            w-9
                                            -translate-y-1/2
                                            items-center
                                            justify-center
                                            rounded-lg
                                            text-slate-400
                                            transition
                                            hover:bg-slate-100
                                            hover:text-slate-700
                                        "
                                        title={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}

                            <div>
                                <label className="text-sm font-bold text-slate-700">
                                    Confirm Password
                                </label>

                                <div className="group relative mt-2">
                                    <Lock
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600"
                                    />

                                    <input
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="confirmPassword"
                                        value={
                                            formData.confirmPassword
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Confirm your password"
                                        autoComplete="new-password"
                                        disabled={loading}
                                        required
                                        className="
                                            h-13
                                            w-full
                                            rounded-xl
                                            border
                                            border-slate-200
                                            bg-slate-50/80
                                            pl-11
                                            pr-12
                                            text-slate-700
                                            outline-none
                                            transition
                                            placeholder:text-slate-400
                                            focus:border-blue-500
                                            focus:bg-white
                                            focus:ring-4
                                            focus:ring-blue-100
                                            disabled:cursor-not-allowed
                                            disabled:opacity-60
                                        "
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                (prev) =>
                                                    !prev
                                            )
                                        }
                                        disabled={loading}
                                        className="
                                            absolute
                                            right-2
                                            top-1/2
                                            flex
                                            h-9
                                            w-9
                                            -translate-y-1/2
                                            items-center
                                            justify-center
                                            rounded-lg
                                            text-slate-400
                                            transition
                                            hover:bg-slate-100
                                            hover:text-slate-700
                                        "
                                        title={
                                            showConfirmPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Password Hint */}

                            <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-3.5 py-3 text-xs text-slate-500">
                                <CheckCircle2
                                    size={15}
                                    className="mt-0.5 shrink-0 text-emerald-500"
                                />

                                <p className="leading-5">
                                    Use at least 6 characters for your password.
                                </p>
                            </div>

                            {/* Submit */}

                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={
                                    !loading
                                        ? {
                                              y: -2,
                                          }
                                        : {}
                                }
                                whileTap={
                                    !loading
                                        ? {
                                              scale: 0.99,
                                          }
                                        : {}
                                }
                                className="
                                    flex
                                    h-13
                                    w-full
                                    items-center
                                    justify-center
                                    gap-3
                                    rounded-xl
                                    bg-gradient-to-r
                                    from-blue-600
                                    to-cyan-500
                                    font-black
                                    text-white
                                    shadow-lg
                                    shadow-blue-500/20
                                    transition
                                    hover:from-blue-700
                                    hover:to-cyan-600
                                    hover:shadow-xl
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >
                                {loading ? (
                                    <>
                                        <Loader2
                                            size={19}
                                            className="animate-spin"
                                        />
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={19} />
                                        Create Account
                                        <ArrowRight size={17} />
                                    </>
                                )}
                            </motion.button>

                            {/* Divider */}

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200" />
                                </div>

                                <div className="relative flex justify-center">
                                    <span className="bg-white px-4 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            {/* Social */}

                            <div className="grid grid-cols-2 gap-3">

                                <button
                                    type="button"
                                    onClick={
                                        handleGoogleLogin
                                    }
                                    className="
                                        flex
                                        h-12
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-xl
                                        border
                                        border-slate-200
                                        bg-white
                                        font-bold
                                        text-slate-700
                                        transition
                                        hover:-translate-y-0.5
                                        hover:border-slate-300
                                        hover:bg-slate-50
                                        hover:shadow-sm
                                    "
                                >
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-lg font-black text-red-500">
                                        G
                                    </span>
                                    Google
                                </button>

                                <button
                                    type="button"
                                    onClick={handleFacebookLogin}
                                    className="
                                        flex
                                        h-12
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-xl
                                        border
                                        border-slate-200
                                        bg-white
                                        font-bold
                                        text-slate-700
                                        transition
                                        hover:-translate-y-0.5
                                        hover:border-slate-300
                                        hover:bg-slate-50
                                        hover:shadow-sm
                                    "
                                >
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-lg font-black text-blue-600">
                                        f
                                    </span>
                                    Facebook
                                </button>

                            </div>

                            {/* Login */}

                            <div className="flex items-center justify-center gap-2 pt-2">
                                <p className="text-sm text-slate-500">
                                    Already have an account?
                                </p>

                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 transition hover:text-blue-700"
                                >
                                    Login
                                    <ArrowRight size={14} />
                                </Link>
                            </div>

                            {/* Security */}

                            <div className="flex items-center justify-center gap-2 pt-1 text-[11px] font-semibold text-slate-400">
                                <ShieldCheck
                                    size={14}
                                    className="text-emerald-500"
                                />
                                Secure account creation
                            </div>

                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default Register;