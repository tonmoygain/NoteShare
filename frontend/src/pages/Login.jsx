import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    User,
    Lock,
    Eye,
    EyeOff,
    LogIn,
    Loader2,
    ShieldCheck,
} from "lucide-react";

import API from "../services/api";

function Login() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [showPassword, setShowPassword] =
        useState(false);


    const handleChange = (e) => {

        setError("");

        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        if (loading) return;

        setError("");

        const username =
            formData.username.trim();

        const password =
            formData.password;


        if (!username) {

            setError(
                "Please enter your username."
            );

            return;

        }

        if (!password) {

            setError(
                "Please enter your password."
            );

            return;

        }


        try {

            setLoading(true);

            const response = await API.post(
                "token/",
                {
                    username,
                    password,
                }
            );


            /*
             * Clear previous authentication data
             */

            localStorage.clear();


            /*
             * Save new authentication data
             */

            localStorage.setItem(
                "access",
                response.data.access
            );

            localStorage.setItem(
                "refresh",
                response.data.refresh
            );

            localStorage.setItem(
                "username",
                username
            );


            /*
             * Return to homepage
             */

            navigate("/");

            /*
             * Refresh so Header/Auth state
             * updates immediately.
             */

            window.location.reload();

        } catch (error) {

            console.error(
                "Login Error:",
                error
            );

            if (
                error.response?.status === 401
            ) {

                setError(
                    "Invalid username or password."
                );

            } else {

                setError(
                    error.response?.data?.detail ||
                    error.response?.data?.error ||
                    "Login failed. Please try again."
                );

            }

        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-blue-600 to-cyan-500 flex items-center justify-center p-6">

            {/* Background Effects */}

            <div className="absolute inset-0 overflow-hidden pointer-events-none">

                <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>

                <div className="absolute -bottom-40 -left-32 w-[28rem] h-[28rem] rounded-full bg-cyan-300/10 blur-3xl"></div>

            </div>


            {/* Login Card */}

            <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-white/30 overflow-hidden">

                {/* Header */}

                <div className="bg-gradient-to-r from-indigo-700 via-blue-600 to-cyan-500 px-8 py-9 text-white">

                    <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/10 flex items-center justify-center">

                        <LogIn size={28} />

                    </div>


                    <h1 className="text-3xl font-black mt-5">

                        Welcome Back

                    </h1>


                    <p className="text-blue-100 mt-2 leading-6">

                        Login to access your notes, blogs and study rooms.

                    </p>

                </div>


                {/* Form */}

                <form
                    onSubmit={handleSubmit}
                    className="p-8 space-y-5"
                >

                    {/* Error */}

                    {error && (

                        <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 rounded-2xl px-4 py-3">

                            <span className="w-6 h-6 shrink-0 rounded-full bg-red-100 flex items-center justify-center text-xs font-black">

                                !

                            </span>

                            <p className="text-sm font-semibold leading-6">

                                {error}

                            </p>

                        </div>

                    )}


                    {/* Username */}

                    <div>

                        <label className="block text-sm font-bold text-slate-700">

                            Username

                        </label>

                        <div className="relative mt-2">

                            <User
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Enter your username"
                                autoComplete="username"
                                disabled={loading}
                                className="w-full h-13 rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-slate-700 outline-none transition focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                                required
                            />

                        </div>

                    </div>


                    {/* Password */}

                    <div>

                        <label className="block text-sm font-bold text-slate-700">

                            Password

                        </label>

                        <div className="relative mt-2">

                            <Lock
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                disabled={loading}
                                className="w-full h-13 rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-12 text-slate-700 outline-none transition focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                                required
                            />


                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(
                                        (prev) => !prev
                                    )
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
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


                    {/* Security Note */}

                    <div className="flex items-start gap-2 text-xs text-slate-400">

                        <ShieldCheck
                            size={16}
                            className="text-emerald-500 shrink-0 mt-0.5"
                        />

                        <p className="leading-5">

                            Your account session is protected with secure authentication.

                        </p>

                    </div>


                    {/* Submit */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-13 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl font-black transition shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >

                        {loading ? (

                            <>
                                <Loader2
                                    size={19}
                                    className="animate-spin"
                                />

                                Logging In...

                            </>

                        ) : (

                            <>
                                <LogIn size={19} />

                                Login

                            </>

                        )}

                    </button>


                    {/* Register */}

                    <div className="pt-3 text-center">

                        <p className="text-sm text-slate-500">

                            Don't have an account?{" "}

                            <Link
                                to="/register"
                                className="text-blue-600 font-bold hover:text-blue-700 hover:underline"
                            >

                                Create one

                            </Link>

                        </p>

                    </div>

                    <div className="relative my-7">

                        <div className="absolute inset-0 flex items-center">

                            <div className="w-full border-t border-slate-200"></div>

                        </div>

                        <div className="relative flex justify-center">

                            <span className="bg-white px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Or continue with
                            </span>

                        </div>

                    </div>

                    <div className="grid grid-cols-2 gap-3">

                        <button
                            type="button"
                            onClick={() =>
                                window.location.href =
                                    "http://127.0.0.1:8000/accounts/google/login/"
                            }
                            className="h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-slate-700 transition flex items-center justify-center gap-2"
                        >
                            <span className="text-lg font-black text-red-500">
                                G
                            </span>
                            Google
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                window.location.href =
                                    "http://127.0.0.1:8000/accounts/facebook/login/"
                            }
                            className="h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-slate-700 transition flex items-center justify-center gap-2"
                        >
                            <span className="text-lg font-black text-blue-600">
                                F
                            </span>
                            Facebook
                        </button>

                    </div>

                </form>

            </div>

        </div>

    );
}

export default Login;