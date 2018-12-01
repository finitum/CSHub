import {server} from "../../../index";
import socket, {Socket} from "socket.io";
import {
    ClientDataUpdated,
    ClientCursorUpdated,
    ClientCursorUpdatedCallBack
} from "../../../../../cshub-shared/src/api-calls";
import {EditDataHandler} from "./EditDataHandler";
import {TogglePostJoin} from "../../../../../cshub-shared/src/api-calls";
import {IRealtimeEdit} from "../../../../../cshub-shared/src/api-calls";
import cookieParser from "cookie-parser";
import {customValidator, validateMultipleInputs} from "../../../utilities/StringUtils";
import {hasAccessToPost, postAccessType} from "../../../auth/validateRights/PostAccess";

export const io = socket(server);

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

    socketConn.on(TogglePostJoin.getURL, (togglePost: TogglePostJoin, fn: (data: IRealtimeEdit) => void) => {
        const inputsValidation = customValidator({
            input: togglePost.postHash
        });

        // TODO write middleware for the auth instead of this :)

        if (inputsValidation.valid) {
            hasAccessToPost(togglePost.postHash, socketConn.request.cookies["token"])
                .then((approved: postAccessType) => {
                    if (approved.access) {
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
                    } else {
                        fn(null);
                    }
                })
        } else {
            fn(null);
        }
    });
});
