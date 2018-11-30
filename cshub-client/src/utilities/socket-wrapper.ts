import {ISocketRequest} from "../../../cshub-shared/src/models/ISocketRequest";

export class SocketWrapper {

    public static emitSocket(request: ISocketRequest, sockets: any) {
        sockets.emit(request.URL, request, request.callback);
    }
}
