import { IApiRequest } from "./IApiRequest";

export interface ISocketRequest extends IApiRequest<void> {
    callback?: (...params: any[]) => void;
}
