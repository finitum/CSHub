import {IApiRequest} from "./IApiRequest";

export interface ISocketRequest extends IApiRequest {
    callback: (...params: any[]) => void;
}
