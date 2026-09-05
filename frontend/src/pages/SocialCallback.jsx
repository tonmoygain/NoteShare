import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import API from "../services/api";
import Toast from "../components/Toast";

function SocialCallback() {

    const navigate = useNavigate();

    const [searchParams] =
        useSearchParams();

    const [toast, setToast] = useState(null);

    useEffect(() => {

        const completeSocialLogin =
            async () => {

                const code =
                    searchParams.get(
                        "code"
                    );

                if (!code) {

                    navigate("/login");
                    return;

                }

                try {

                    const response =
                        await API.get(
                            `social-login/token/?code=${encodeURIComponent(code)}`
                        );


                    localStorage.clear();


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
                        response.data.username
                    );


                    navigate("/");

                    window.location.reload();

                } catch (error) {

                    console.error(
                        "Social Login Error:",
                        error
                    );

                    setToast({
                        type: "error",
                        message:
                            error.response?.data?.detail ||
                            "Google login failed.",
                    });

                    setTimeout(() => {
                        navigate("/login");
                    }, 1000);

                }

            };


        completeSocialLogin();

    }, [navigate, searchParams]);


    return (

        <>
            <Toast
                toast={toast}
                onClose={() => setToast(null)}
            />

            <div className="min-h-screen flex items-center justify-center bg-slate-50">

                <div className="text-center">

                    <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center animate-pulse">

                        <div className="w-6 h-6 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>

                    </div>

                    <h2 className="text-xl font-black text-slate-800 mt-5">

                        Completing Google Sign In...

                    </h2>

                    <p className="text-sm text-slate-400 mt-2">

                        Please wait while we sign you into NoteShare.

                    </p>

                </div>

            </div>

        </>

    );

}

export default SocialCallback;