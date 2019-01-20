import axios, {AxiosError, AxiosRequestConfig, AxiosResponse} from "axios";

import {IApiRequest} from "../../../cshub-shared/src/models/IApiRequest";
import dataState from "../store/data";
import {Requests} from "../../../cshub-shared/src/api-calls";
import uiState from "../store/ui";
import userState from "../store/user";
import router from "../views/router/router";
import {Routes} from "../../../cshub-shared/src/Routes";

const axiosApi = axios.create({
    baseURL: process.env.VUE_APP_API_URL || (window as any).appConfig.VUE_APP_API_URL,
    withCredentials: true,
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Version": process.env.VUE_APP_VERSION
    }
});

axiosApi.interceptors.request.use((config: AxiosRequestConfig) => {

    if (!dataState.hasConnection && config.url !== Requests.VERIFYTOKEN) {
        throw new axios.Cancel();
    } else {
        return config;
    }
});

axiosApi.interceptors.response.use((value: AxiosResponse<any>) => {
    return value;
}, (error: any) => {
    if (error.response.status === 401) {
        const isLoggedIn = userState.isLoggedIn;
        const tokenVal = getCookie("token");

        const loggedOut = !isLoggedIn || tokenVal.length === 0;
        const button = loggedOut ? {
            text: "Log in",
            jsAction: () => {
                window.open(Routes.LOGIN, "_self");
            }
        } : null;

        uiState.setNotificationDialogState({
            on: true,
            header: "Unauthorized!",
            text: `You are not authorized to do this! ${!loggedOut ? " Click the button below to log in." : ""}`,
            button
        });
    } else if (error.response.status.toString().startsWith("5")) {
        uiState.setNotificationDialogState({
            on: true,
            header: "Error!",
            text: "The server experienced an error... If this error occurs again, please report it to us at github.com/RobbinBaauw/CSHub/issues :)"
        });
    }
});

export const getCookie = (name: string) => {
    const cookieWithPrependedSemi = `; ${document.cookie}`;
    const cookieParts = cookieWithPrependedSemi.split(`; ${name}=`);
    if (cookieParts.length === 2) {
        return cookieParts.pop().split(";").shift();
    } else {
        return "";
    }
};

export class ApiWrapper {

    public static sendPostRequest(request: IApiRequest, callback?: (...args: any) => void, error?: (err: AxiosError) => void) {
        axiosApi
            .post(request.URL, request, {
                withCredentials: true
            })
            .then((response: AxiosResponse<any>) => {
                if (callback) {
                    callback(response.data);
                }
            })
            .catch((err: AxiosError) => {
                if (error) {
                    error(err);
                }
            });
    }

    public static sendGetRequest(request: IApiRequest, callback?: (...args: any) => void, error?: (err: AxiosError) => void) {
        axiosApi
            .get(request.URL)
            .then((response: AxiosResponse<any>) => {
                if (callback) {
                    callback(response.data);
                }
            })
            .catch((err: AxiosError) => {
                if (error) {
                    error(err);
                }
            });
    }
}
