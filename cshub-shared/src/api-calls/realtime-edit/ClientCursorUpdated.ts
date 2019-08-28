import { SocketRequests } from "../SocketRequests";
import { IRealtimeSelect } from "./IRealtimeSelect";

export class ClientCursorUpdated {
    public static getURL: string = SocketRequests.CLIENTCURSORUPDATED;
    public URL: string = ClientCursorUpdated.getURL;

    constructor(public selection: IRealtimeSelect) {}
}
