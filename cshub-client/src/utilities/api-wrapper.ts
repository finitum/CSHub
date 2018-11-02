import axios, {AxiosError, AxiosRequestConfig, AxiosResponse} from "axios";

import {IApiRequest} from "../../../cshub-shared/models/IApiRequest";
import dataState from "../store/data";
import {NonAuthRequests} from "../../../cshub-shared/api-calls";

const axiosApi = axios.create({
    baseURL: process.env.VUE_APP_API_URL,
    withCredentials: true,
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
});

axiosApi.interceptors.request.use((config: AxiosRequestConfig) => {

    if(!dataState.hasConnection && config.url !== NonAuthRequests.VERIFYTOKEN) {
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
                error(err);
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
                error(err);
            });
    }
}
