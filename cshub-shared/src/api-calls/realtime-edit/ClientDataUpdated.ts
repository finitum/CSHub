import {SocketRequests} from "../SocketRequests";
import {IRealtimeEdit} from "./IRealtimeEdit";
import {ISocketRequest} from "../../models/ISocketRequest";

export class ClientDataUpdated implements ISocketRequest {

    public static getURL: string = SocketRequests.CLIENTCURSORUPDATED;
    public URL: string = ClientDataUpdated.getURL;

    constructor(public edit: IRealtimeEdit, public callback: () => void) {}

}
