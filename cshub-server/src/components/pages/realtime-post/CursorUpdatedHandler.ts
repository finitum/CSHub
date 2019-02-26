import {CursorList} from "./CursorList";
import {IRealtimeSelect, ServerCursorUpdated} from "../../../../../cshub-shared/src/api-calls/realtime-edit";
import {Socket} from "socket.io";
import {io} from "./socket-receiver";
import randomColor from "randomcolor";
import {validateAccessToken} from "../../../auth/JWTHandler";
import {IJWTToken} from "../../../../../cshub-shared/src/models";

export class CursorUpdatedHandler {

    private static cursorList = new CursorList();

    public static getCurrentPostData(postHash: number): IRealtimeSelect[] {
        return CursorUpdatedHandler.cursorList.getSelectList(postHash);
    }

    public static removeCursor(currSocket: Socket) {
        const userModel = validateAccessToken(currSocket.request.cookies["token"]);

        for (const room in currSocket.rooms) {
            const postHash = parseInt(currSocket.rooms[room].split("POST_")[1], 10);
            if (!isNaN(postHash)) {
                const select: IRealtimeSelect = {
                    postHash,
                    color: null,
                    userName: userModel.user.firstname,
                    user: userModel.user,
                    active: false,
                    selection: {
                        index: 0,
                        length: 0
                    }
                };

                const response = new ServerCursorUpdated(select, () => {});
                io.to(room).emit(response.URL, response);

                const currSelects = CursorUpdatedHandler.cursorList.getSelectList(postHash);
                const currUserIndex = currSelects.findIndex((x) => x.user.id === userModel.user.id);
                if (currUserIndex !== -1) {
                    currSelects.splice(currUserIndex, 1);
                }
            }
        }
    }

    public static addUser(currSocket: Socket, postHash: number) {
        const currSelects = CursorUpdatedHandler.cursorList.getSelectList(postHash);
        const roomId = `POST_${postHash}`;

        while (true) {

            const userModel = validateAccessToken(currSocket.request.cookies["token"]);

            const color = randomColor({
                luminosity: "bright",
                alpha: 0.1
            });
            const user = userModel.user;
            const userName = userModel.user.firstname;


            const index = currSelects.findIndex((x) => x.color === color);
            if (index === -1) {
                const select: IRealtimeSelect = {
                    postHash,
                    color,
                    userName,
                    user,
                    active: true,
                    selection: {
                        index: 0,
                        length: 0
                    }
                };

                currSelects.push(select);

                const response = new ServerCursorUpdated(select, () => {});
                io.to(roomId).emit(response.URL, response);

                break;
            }
        }

    }

    public static changedCursor(select: IRealtimeSelect, currSocket: Socket): void {
        const currSelects = CursorUpdatedHandler.cursorList.getSelectList(select.postHash);

        const roomId = `POST_${select.postHash}`;

        const currUserIndex = currSelects.findIndex((x) => x.user.id === select.user.id);

        if (select.active) {
            if (currUserIndex === -1) {
                this.addUser(currSocket, select.postHash);
            } else {
                const previousData = currSelects[currUserIndex];
                select.color = previousData.color;
                select.userName = previousData.userName;
                select.user = previousData.user;
                select.postHash = previousData.postHash;

                currSelects[currUserIndex] = {
                    ...previousData,
                    ...select
                };
            }
        } else if (currUserIndex !== -1) {
            currSelects.splice(currUserIndex, 1);
        }


        const response = new ServerCursorUpdated(select, () => {});
        io.to(roomId).emit(response.URL, response);
    }
}
