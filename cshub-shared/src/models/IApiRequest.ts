export interface IApiRequest {
    URL: string;
    headers?: { [key: string]: string };
    params?: { [key: string]: string };
}
