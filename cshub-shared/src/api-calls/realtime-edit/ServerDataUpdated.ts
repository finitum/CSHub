import {ISocketRequest} from "../../models/ISocketRequest";
import {SocketRequests} from "../SocketRequests";
import {IUserEdit} from "./IUserEdit";
import {IServerEdit} from "./IServerEdit";

export class ServerDataUpdated implements ISocketRequest {

    public static getURL: string = SocketRequests.SERVERDATAUPDATED;
    public URL: string = ServerDataUpdated.getURL;

    constructor(public edit: IServerEdit, public callback: () => void) {}

}
