import {app, server} from "../../../index";
import socket, {Socket} from "socket.io";
import {
    ClientDataUpdated,
    ClientCursorUpdated, IRealtimeSelect
} from "../../../../../cshub-shared/src/api-calls";
import {DataUpdatedHandler} from "./DataUpdatedHandler";
import {TogglePostJoin} from "../../../../../cshub-shared/src/api-calls";
import {IRealtimeEdit} from "../../../../../cshub-shared/src/api-calls";
import cookieParser from "cookie-parser";
import {customValidator, validateMultipleInputs} from "../../../utilities/StringUtils";
import {hasAccessToPost, postAccessType} from "../../../auth/validateRights/PostAccess";
import {CursorUpdatedHandler} from "./CursorUpdatedHandler";

export const io = socket(server);

const cookieparser = () => {
    const parser = cookieParser.apply(null, arguments);

    return (socket, next) => {
        parser(socket.request, null, next);
    }
};

io.use(cookieparser());

io.on("connection", (socketConn: Socket) => {

    socketConn.on("disconnect", () => {
        CursorUpdatedHandler.removeCursor(socketConn);
    });

    socketConn.on(ClientCursorUpdated.getURL, (cursorUpdated: ClientCursorUpdated) => {
        CursorUpdatedHandler.changedCursor(cursorUpdated.selection, socketConn);
    });

    socketConn.on(ClientDataUpdated.getURL, (dataUpdated: ClientDataUpdated) => {
        DataUpdatedHandler.applyNewEdit(dataUpdated.edit, socketConn);
    });

    socketConn.on(TogglePostJoin.getURL, (togglePost: TogglePostJoin, fn: (edit: IRealtimeEdit, select: IRealtimeSelect[]) => void) => {
        const inputsValidation = customValidator({
            input: togglePost.postHash
        });

        if (inputsValidation.valid) {
            hasAccessToPost(togglePost.postHash, socketConn.request.cookies["token"])
                .then((approved: postAccessType) => {
                    if (approved.access && approved.editRights) {
                        const roomName = `POST_${togglePost.postHash}`;
                        if (togglePost.join) {
                            socketConn.join(roomName);

                            let edit: IRealtimeEdit;

                            DataUpdatedHandler.getCurrentPostData(togglePost.postHash)
                                .then((data) => {
                                    edit = data;
                                    const select = CursorUpdatedHandler.getCurrentPostData(togglePost.postHash);
                                    fn(edit, select);
                                })
                        } else {
                            socketConn.leave(roomName);
                            fn(null, null);
                        }
                    } else {
                        fn(null, null);
                    }
                })
        } else {
            fn(null, null);
        }
    });
});
