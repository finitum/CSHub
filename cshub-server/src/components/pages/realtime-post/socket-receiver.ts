import {server} from "../../../index";
import socket, {Socket} from "socket.io";
import {
    ClientDataUpdated,
    ClientDataUpdatedCallBack,
    ClientCursorUpdated,
    ClientCursorUpdatedCallBack
} from "../../../../../cshub-shared/src/api-calls";
import {EditDataHandler} from "./EditDataHandler";

const io = socket(server);

export let socketConnection: Socket;

io.on("connection", (socketConn: Socket) => {

    socketConnection = socketConn;

    socketConn.on(ClientCursorUpdated.getURL, (cursorUpdated: ClientCursorUpdated, fn: (data: ClientCursorUpdatedCallBack) => void) => {

    });

    socketConn.on(ClientDataUpdated.getURL, (dataUpdated: ClientDataUpdated, fn: (data: ClientDataUpdatedCallBack) => void) => {
        EditDataHandler.applyNewEdit(dataUpdated.edit)
        fn(new ClientDataUpdatedCallBack(1));
    });
});
