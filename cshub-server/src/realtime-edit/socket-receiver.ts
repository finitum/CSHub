import socket, { Server, Socket } from "socket.io";
import { ClientDataUpdated, ClientCursorUpdated, IRealtimeSelect } from "../../../cshub-shared/src/api-calls";
import { DataUpdatedHandler } from "./DataUpdatedHandler";
import { TogglePostJoin } from "../../../cshub-shared/src/api-calls";
import { IRealtimeEdit } from "../../../cshub-shared/src/api-calls";
import cookieParser from "cookie-parser";
import { customValidator } from "../utilities/StringUtils";
import { hasAccessToPostJWT, PostAccessType } from "../auth/validateRights/PostAccess";
import { CursorUpdatedHandler } from "./CursorUpdatedHandler";
import { Server as HttpServer } from "http";

export let io: Server;

export const registerSockets = (server: HttpServer): void => {
    io = socket(server);

    const cookieparser = (...args) => {
        // TODO: Why does this break?
        const parser = cookieParser(...args);

        return (socket, next) => {
            parser(socket.request, socket.response, next);
        };
    };

    io.use(cookieparser());

    io.on("connection", (socketConn: Socket) => {
        let madeConnection = false;

        socketConn.on("disconnecting", () => {
            CursorUpdatedHandler.removeCursor(socketConn);
        });

        socketConn.on(ClientCursorUpdated.getURL, (cursorUpdated: ClientCursorUpdated) => {
            if (!madeConnection) {
                socketConn.disconnect(true);
            }
            CursorUpdatedHandler.changedCursor(cursorUpdated.selection, socketConn);
        });

        socketConn.on(ClientDataUpdated.getURL, (dataUpdated: ClientDataUpdated) => {
            if (!madeConnection) {
                socketConn.disconnect(true);
            }
            DataUpdatedHandler.applyNewEdit(dataUpdated.edit, socketConn);
        });

        socketConn.on(
            TogglePostJoin.getURL,
            (
                togglePost: TogglePostJoin,
                fn: (edit: IRealtimeEdit | null, select: IRealtimeSelect[] | null) => void,
            ) => {
                const inputsValidation = customValidator({
                    input: togglePost.postHash,
                });

                if (inputsValidation.valid) {
                    hasAccessToPostJWT(togglePost.postHash, socketConn.request.cookies["token"]).then(
                        (approved: PostAccessType) => {
                            if (approved.canEdit) {
                                const roomName = `POST_${togglePost.postHash}`;
                                if (togglePost.join) {
                                    socketConn.join(roomName);

                                    madeConnection = true;

                                    let edit: IRealtimeEdit | null;

                                    DataUpdatedHandler.getCurrentPostData(togglePost.postHash).then((data) => {
                                        edit = data;
                                        const select = CursorUpdatedHandler.getCurrentPostData(togglePost.postHash);

                                        CursorUpdatedHandler.addUser(socketConn, togglePost.postHash);

                                        fn(edit, select);
                                    });
                                } else {
                                    socketConn.leave(roomName);
                                    fn(null, null);
                                }
                            } else {
                                fn(null, null);
                            }
                        },
                    );
                } else {
                    fn(null, null);
                }
            },
        );
    });
};
