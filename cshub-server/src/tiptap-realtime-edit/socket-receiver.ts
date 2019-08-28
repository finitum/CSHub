import { server } from "../index";
import socket, { Socket } from "socket.io";
import { TogglePostJoin, AutomergeUpdatePackage } from "../../../cshub-shared/src/api-calls/tiptap-realtime-edit";
import { IRealtimeEdit } from "../../../cshub-shared/src/api-calls";
import cookieParser from "cookie-parser";
import { customValidator } from "../utilities/StringUtils";
import { hasAccessToPostJWT, PostAccessType } from "../auth/validateRights/PostAccess";
import { DataUpdatedHandler } from "../realtime-edit/DataUpdatedHandler";
import { Message, DocSet, Connection } from "automerge";
import { checkTokenValidityFromJWT } from "../auth/AuthMiddleware";

export const io = socket(server);

const cookieparser = () => {
    // @ts-ignore TODO: Why does this break?
    const parser = cookieParser.apply(null, arguments);

    return (socket, next) => {
        parser(socket.request, socket.response, next);
    };
};

io.use(cookieparser());

io.on("connection", (socketConn: Socket) => {
    const AutomergeDocuments: Map<number, DocSet<any>> = new Map();
    const connections: Map<number, Connection<any>> = new Map();

    socketConn.on("disconnecting", () => {});
    // socketConn.on(ClientCursorUpdated.getURL, (cursorUpdated: ClientCursorUpdated) => {});

    socketConn.on(AutomergeUpdatePackage.getURL, (msg: Message) => {
        console.log(msg);
    });

    socketConn.on(TogglePostJoin.getURL, async (togglePost: TogglePostJoin, fn: () => void) => {
        const inputsValidation = customValidator({
            input: togglePost.postHash
        });

        if (!inputsValidation.valid) {
            return fn();
        }

        const tokenValidator = checkTokenValidityFromJWT(socketConn.request.cookies["token"]);
        if (!tokenValidator) {
            return fn();
        }
        const user = tokenValidator.user;

        const approved = await hasAccessToPostJWT(togglePost.postHash, socketConn.request.cookies["token"]);

        if (!approved.canEdit) {
            return fn();
        }

        const roomName = `POST_${togglePost.postHash}`;
        if (!togglePost.join) {
            socketConn.leave(roomName);
            fn();
        }

        socketConn.join(roomName);

        let document = AutomergeDocuments.get(togglePost.postHash);
        if (!document) {
            document = new DocSet<any>();
            AutomergeDocuments.set(togglePost.postHash, document);
        }

        const connection = new Connection(document, message => {
            socketConn.emit("send_operation", message);
        });
        connections.set(user.id, connection);
        connection.open();

        // let edit: IRealtimeEdit | null;
        //
        // DataUpdatedHandler.getCurrentPostData(togglePost.postHash).then(data => {
        //     edit = data;
        //     // const select = CursorUpdatedHandler.getCurrentPostData(togglePost.postHash);
        //     //
        //     // CursorUpdatedHandler.addUser(socketConn, togglePost.postHash);
        //
        //     fn(edit, null);
        // });
    });
});
