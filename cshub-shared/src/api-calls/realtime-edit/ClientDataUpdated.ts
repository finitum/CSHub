import {IApiRequest} from "../../models";
import {SocketRequests} from "../SocketRequests";
import {IUserEdit} from "./IUserEdit";
import {ISocketRequest} from "../../models/ISocketRequest";

export class ClientDataUpdatedCallBack {

    constructor(public test: number) {}
}

export class ClientDataUpdated implements ISocketRequest {

    public static getURL: string = SocketRequests.CLIENTCURSORUPDATED;
    public URL: string = ClientDataUpdated.getURL;

    constructor(public edit: IUserEdit, public callback: (data: ClientDataUpdatedCallBack) => void) {}

}
