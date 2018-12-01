import {SocketRequests} from "../SocketRequests";
import {IRealtimeSelect} from "./IRealtimeSelect";

export class ServerCursorUpdated {

    public static getURL: string = SocketRequests.SERVERCURSORUPDATED;
    public URL: string = ServerCursorUpdated.getURL;

    constructor(public select: IRealtimeSelect, public callback: () => void) {}
}
