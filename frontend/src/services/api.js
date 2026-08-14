import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000/api/",
});


/*
|--------------------------------------------------------------------------
| Attach access token
|--------------------------------------------------------------------------
*/

API.interceptors.request.use(
    (config) => {

        const token =
            localStorage.getItem("access");

        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;

        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);


/*
|--------------------------------------------------------------------------
| Refresh access token automatically on 401
|--------------------------------------------------------------------------
*/

let isRefreshing = false;
let refreshSubscribers = [];


const subscribeTokenRefresh = (callback) => {

    refreshSubscribers.push(callback);

};


const onRefreshed = (newToken) => {

    refreshSubscribers.forEach(
        (callback) => callback(newToken)
    );

    refreshSubscribers = [];

};


API.interceptors.response.use(

    (response) => response,

    async (error) => {

        const originalRequest =
            error.config;


        if (
            error.response?.status !== 401 ||
            originalRequest?._retry
        ) {

            return Promise.reject(error);

        }


        /*
         * Don't try to refresh the refresh-token request itself.
         */

        if (
            originalRequest?.url?.includes(
                "token/refresh/"
            )
        ) {

            return Promise.reject(error);

        }


        const refresh =
            localStorage.getItem("refresh");


        if (!refresh) {

            return Promise.reject(error);

        }


        if (isRefreshing) {

            return new Promise(
                (resolve, reject) => {

                    subscribeTokenRefresh(
                        (newToken) => {

                            if (!newToken) {

                                reject(error);

                                return;

                            }

                            originalRequest.headers.Authorization =
                                `Bearer ${newToken}`;

                            resolve(
                                API(originalRequest)
                            );

                        }
                    );

                }
            );

        }


        originalRequest._retry = true;
        isRefreshing = true;


        try {

            const response =
                await axios.post(
                    "http://127.0.0.1:8000/api/token/refresh/",
                    {
                        refresh,
                    }
                );


            const newAccessToken =
                response.data.access;


            localStorage.setItem(
                "access",
                newAccessToken
            );


            onRefreshed(
                newAccessToken
            );


            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;


            return API(
                originalRequest
            );

        } catch (refreshError) {

            onRefreshed(null);


            localStorage.removeItem(
                "access"
            );

            localStorage.removeItem(
                "refresh"
            );

            localStorage.removeItem(
                "username"
            );


            window.location.href =
                "/login";


            return Promise.reject(
                refreshError
            );

        } finally {

            isRefreshing = false;

        }

    }

);


export default API;