import { ISocketRequest } from "../../../cshub-shared/src/models";
import { logStringConsole } from "./debugConsole";

export class SocketWrapper {
    public static emitSocket(request: ISocketRequest, sockets: any) {
        sockets.emit(request.URL, request, request.callback);
    }

    public static reconnectSocket(sockets: any) {
        logStringConsole("Reconnecting socket");
        sockets.close();
        sockets.open();
    }
}
