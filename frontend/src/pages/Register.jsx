import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    UserPlus,
    Loader2,
    CheckCircle2,
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
            "http://127.0.0.1:8000/accounts/google/login/";

    };


    const handleFacebookLogin = () => {

        alert(
            "Facebook login is not configured yet."
        );

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        if (loading) return;

        setError("");

        const username =
            formData.username.trim();

        const email =
            formData.email.trim();

        const password =
            formData.password;

        const confirmPassword =
            formData.confirmPassword;


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


            alert(
                "Registration successful. Please login."
            );

            navigate("/login");

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

        <div className="min-h-screen bg-gradient-to-br from-blue-700 via-cyan-500 to-indigo-700 flex items-center justify-center p-6">

            <div className="absolute inset-0 overflow-hidden pointer-events-none">

                <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>

                <div className="absolute -bottom-40 -left-32 w-[28rem] h-[28rem] rounded-full bg-blue-300/10 blur-3xl"></div>

            </div>


            <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-white/30 overflow-hidden">

                {/* Header */}

                <div className="bg-gradient-to-r from-blue-700 to-cyan-500 px-8 py-9 text-white">

                    <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/10 flex items-center justify-center">

                        <UserPlus size={28} />

                    </div>


                    <h1 className="text-3xl font-black mt-5">

                        Create Account

                    </h1>


                    <p className="text-blue-100 mt-2 leading-6">

                        Join NoteShare and start sharing academic resources.

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
                                placeholder="Choose a username"
                                autoComplete="username"
                                disabled={loading}
                                className="w-full h-13 rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-slate-700 outline-none transition focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                                required
                            />

                        </div>

                    </div>


                    {/* Email */}

                    <div>

                        <label className="block text-sm font-bold text-slate-700">

                            Email

                        </label>

                        <div className="relative mt-2">

                            <Mail
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                autoComplete="email"
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
                                placeholder="Create a password"
                                autoComplete="new-password"
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

                        <label className="block text-sm font-bold text-slate-700">

                            Confirm Password

                        </label>

                        <div className="relative mt-2">

                            <Lock
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
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
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                                disabled={loading}
                                className="w-full h-13 rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-12 text-slate-700 outline-none transition focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                                required
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        (prev) => !prev
                                    )
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
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

                    <div className="flex items-start gap-2 text-xs text-slate-400">

                        <CheckCircle2
                            size={15}
                            className="text-emerald-500 shrink-0 mt-0.5"
                        />

                        <p>
                            Use at least 6 characters for your password.
                        </p>

                    </div>


                    {/* Create Account */}

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

                                Creating Account...

                            </>

                        ) : (

                            <>
                                <UserPlus size={19} />

                                Create Account

                            </>

                        )}

                    </button>


                    {/* Divider */}

                    <div className="relative py-2">

                        <div className="absolute inset-0 flex items-center">

                            <div className="w-full border-t border-slate-200"></div>

                        </div>

                        <div className="relative flex justify-center">

                            <span className="bg-white px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">

                                Or continue with

                            </span>

                        </div>

                    </div>


                    {/* Social Buttons */}

                    <div className="grid grid-cols-2 gap-3">

                        {/* Google */}

                        <button
                            type="button"
                            onClick={
                                handleGoogleLogin
                            }
                            className="h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold transition flex items-center justify-center gap-2"
                        >

                            <span className="w-7 h-7 rounded-full flex items-center justify-center text-lg font-black text-red-500 bg-red-50">

                                G

                            </span>

                            Google

                        </button>


                        {/* Facebook */}

                        <button
                            type="button"
                            onClick={
                                handleFacebookLogin
                            }
                            className="h-12 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 font-bold transition flex items-center justify-center gap-2 cursor-not-allowed"
                        >

                            <span className="w-7 h-7 rounded-full flex items-center justify-center text-lg font-black text-blue-600 bg-blue-50">

                                f

                            </span>

                            Facebook

                        </button>

                    </div>


                    {/* Login */}

                    <div className="pt-3 text-center">

                        <p className="text-sm text-slate-500">

                            Already have an account?{" "}

                            <Link
                                to="/login"
                                className="text-blue-600 font-bold hover:text-blue-700 hover:underline"
                            >

                                Login

                            </Link>

                        </p>

                    </div>

                </form>

            </div>

        </div>

    );
}

export default Register;