import { SocketRequests } from "../SocketRequests";
import { IRealtimeEdit } from "./IRealtimeEdit";

export class ServerDataUpdated {
    public static getURL: string = SocketRequests.SERVERDATAUPDATED;
    public URL: string = ServerDataUpdated.getURL;

    constructor(
        public editOrError:
            | {
                  error: false;
                  edit: IRealtimeEdit;
              }
            | {
                  error: true;
                  message: string;
              }
    ) {}
}
