import {ISocketRequest} from "../../models/ISocketRequest";
import {SocketRequests} from "../SocketRequests";
import {IRealtimeEdit} from "./IRealtimeEdit";

export class ServerDataUpdated implements ISocketRequest {

    public static getURL: string = SocketRequests.SERVERDATAUPDATED;
    public URL: string = ServerDataUpdated.getURL;

    constructor(public edit: IRealtimeEdit) {}

}
