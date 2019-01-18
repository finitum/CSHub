import axios, {AxiosError, AxiosRequestConfig, AxiosResponse} from "axios";

import {IApiRequest} from "../../../cshub-shared/src/models/IApiRequest";
import dataState from "../store/data";
import {Requests} from "../../../cshub-shared/src/api-calls";

const axiosApi = axios.create({
    baseURL: process.env.VUE_APP_API_URL || (window as any)["appConfig"].VUE_APP_API_URL,
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
