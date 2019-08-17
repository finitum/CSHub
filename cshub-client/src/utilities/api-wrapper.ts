import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

import { IApiRequest } from "../../../cshub-shared/src/models";
import { dataState, userState, uiState } from "../store";
import { Requests } from "../../../cshub-shared/src/api-calls";
import { Routes } from "../../../cshub-shared/src/Routes";
import { ServerError } from "../../../cshub-shared/src/models/ServerError";

const axiosApi = axios.create({
    baseURL: process.env.VUE_APP_API_URL || (window as any).appConfig.VUE_APP_API_URL,
    withCredentials: true,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Version: process.env.VUE_APP_VERSION
    }
});

axiosApi.interceptors.request.use((config: AxiosRequestConfig) => {
    if (!dataState.hasConnection && config.url !== Requests.VERIFYTOKEN) {
        throw new axios.Cancel();
    } else {
        return config;
    }
});

axiosApi.interceptors.response.use(
    (value: AxiosResponse<any>) => {
        return value;
    },
    (error: any) => {
        const forceRefreshButton = {
            text: "Force refresh",
            jsAction: () => {
                const promiseChain = caches
                    .keys()
                    .then(cacheNames => {
                        // Step through each cache name and delete it
                        return Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
                    })
                    .then(() => {
                        window.location.reload(true);
                    });
            }
        };

        if (error.response) {
            if (error.response.status === 304) {
                // Do nothing
            } else if (error.response.status === 401 || error.response.status === 403) {
                const isLoggedIn = userState.isLoggedIn;
                const tokenVal = getCookie("token");

                const loggedOut = !isLoggedIn || tokenVal.length === 0;
                const button = loggedOut
                    ? {
                          text: "Log in",
                          jsAction: () => {
                              window.open(Routes.LOGIN, "_self");
                          }
                      }
                    : undefined;

                uiState.setNotificationDialog({
                    on: true,
                    header: `Unauthorized! ${error.response.status}`,
                    text: `You are not authorized to do this! ${
                        !loggedOut ? " Click the button below to log in." : ""
                    }`,
                    button
                });
            } else {
                const response = error.response.data as ServerError;
                if (response.message) {
                    const button = error.response.data.showRefresh ? forceRefreshButton : undefined;

                    uiState.setNotificationDialog({
                        on: true,
                        header: `Error! ${error.response.status}`,
                        text: response.message,
                        button
                    });
                } else {
                    uiState.setNotificationDialog({
                        on: true,
                        header: `Error! ${error.response.status}`,
                        text: `The server experienced an error, but didn't provide an error message :(`
                    });
                }
            }
        } else if (error.message === "Network Error") {
            uiState.setNotificationDialog({
                on: true,
                header: `Network error`,
                text:
                    "A network error was caught, this is most probably a 404. If so, the server might be restarting (okay we should cluster it so we can update better, but so far we haven't), so wait a sec or try force refresh!",
                button: forceRefreshButton
            });
        } else {
            if (!uiState.notificationDialog.on) {
                uiState.setNotificationDialog({
                    on: true,
                    header: `Error!`,
                    text: `There was an error, but no idea what it could be`
                });
            }
        }
    }
);

export const getCookie = (name: string): string => {
    const cookieWithPrependedSemi = `; ${document.cookie}`;
    const cookieParts = cookieWithPrependedSemi.split(`; ${name}=`);
    if (cookieParts.length === 2) {
        return (
            cookieParts
                .pop()! // force as we've checked length already
                .split(";")
                .shift() || ""
        );
    } else {
        return "";
    }
};

export class ApiWrapper {
    public static sendPostRequest(
        request: IApiRequest<any>,
        callback?: (...args: any) => void,
        error?: (err: AxiosError) => void
    ) {
        axiosApi
            .post(request.URL, request, {
                withCredentials: true,
                headers: request.headers,
                params: request.params
            })
            .then((response: AxiosResponse<any>) => {
                if (callback) {
                    if (response === undefined) {
                        callback(null, null);
                    } else {
                        callback(response.data, response.status);
                    }
                }
            })
            .catch((err: AxiosError) => {
                if (error) {
                    error(err);
                }
            });
    }

    public static sendPutRequest(
        request: IApiRequest<any>,
        callback?: (...args: any) => void,
        error?: (err: AxiosError) => void
    ) {
        axiosApi
            .put(request.URL, request, {
                withCredentials: true,
                headers: request.headers,
                params: request.params
            })
            .then((response: AxiosResponse<any>) => {
                if (callback) {
                    if (response === undefined) {
                        callback(null, null);
                    } else {
                        callback(response.data, response.status);
                    }
                }
            })
            .catch((err: AxiosError) => {
                if (error) {
                    error(err);
                }
            });
    }

    /**
     * @deprecated
     */
    public static sendGetRequest(
        request: IApiRequest<any>,
        callback?: (...args: any) => void,
        error?: (err: AxiosError) => void
    ) {
        axiosApi
            .get(request.URL, {
                headers: request.headers,
                params: request.params
            })
            .then((response: AxiosResponse<any>) => {
                if (callback) {
                    if (response === undefined) {
                        callback(null, null);
                    } else {
                        callback(response.data, response.status);
                    }
                }
            })
            .catch((err: AxiosError) => {
                if (error) {
                    error(err);
                }
            });
    }

    public static get<T>(request: IApiRequest<T>): Promise<T> {
        return axiosApi
            .get<T>(request.URL, {
                headers: request.headers,
                params: request.params
            })
            .then(response => {
                return response.data;
            });
    }
}
