import {server} from "../../../index";
import socket, {Socket} from "socket.io";
import {
    ClientDataUpdated,
    ClientCursorUpdated,
    ClientCursorUpdatedCallBack
} from "../../../../../cshub-shared/src/api-calls";
import {EditDataHandler} from "./EditDataHandler";
import {TogglePostJoin} from "../../../../../cshub-shared/src/api-calls";
import {IServerEdit} from "../../../../../cshub-shared/src/api-calls";
import cookieParser from "cookie-parser";

const io = socket(server);

const cookieparser = () => {
    const parser = cookieParser.apply(null, arguments);

    return (socket, next) => {
        parser(socket.request, null, next);
    }
};

io.use(cookieparser());

io.on("connection", (socketConn: Socket) => {

    socketConn.on(ClientCursorUpdated.getURL, (cursorUpdated: ClientCursorUpdated, fn: (data: ClientCursorUpdatedCallBack) => void) => {

    });

    socketConn.on(ClientDataUpdated.getURL, (dataUpdated: ClientDataUpdated, fn: () => void) => {
        EditDataHandler.applyNewEdit(dataUpdated.edit, socketConn);

        fn();
    });

    socketConn.on(TogglePostJoin.getURL, (togglePost: TogglePostJoin, fn: (data: IServerEdit) => void) => {
        // TODO check if the user has accessing rights to this post

        const roomName = `POST_${togglePost.postHash}`;
        if (togglePost.join) {
            socketConn.join(roomName);

            EditDataHandler.getCurrentPostData(togglePost.postHash)
                .then((data) => {
                    fn(data);
                })
        } else {
            socketConn.leave(roomName);
            fn(null);
        }

    });
});
