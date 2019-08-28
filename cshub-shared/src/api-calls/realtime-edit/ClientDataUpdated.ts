import { SocketRequests } from "../SocketRequests";
import { IRealtimeEdit } from "./IRealtimeEdit";

export class ClientDataUpdated {
    public static getURL: string = SocketRequests.CLIENTDATAUPDATED;
    public URL: string = ClientDataUpdated.getURL;

    constructor(public edit: IRealtimeEdit) {}
}
