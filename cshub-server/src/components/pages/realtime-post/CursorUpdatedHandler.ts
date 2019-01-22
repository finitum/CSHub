import {CursorList} from "./CursorList";
import {IRealtimeSelect, ServerCursorUpdated} from "../../../../../cshub-shared/src/api-calls/realtime-edit";
import {Socket} from "socket.io";
import {io} from "./socket-receiver";
import randomColor from "randomcolor";
import {validateAccessToken} from "../../../auth/JWTHandler";

export class CursorUpdatedHandler {

    private static cursorList = new CursorList();

    public static getCurrentPostData(postHash: number): IRealtimeSelect[] {
        return CursorUpdatedHandler.cursorList.getSelectList(postHash);
    }

    public static removeCursor(currSocket: Socket) {
        const userModel = validateAccessToken(currSocket.request.cookies["token"]);

        for (const room in currSocket.rooms) {
            const roomId = parseInt(currSocket.rooms[room].split("POST_")[1]);
            if (!isNaN(roomId)) {
                const currSelects = CursorUpdatedHandler.cursorList.getSelectList(roomId);
                const currUserIndex = currSelects.findIndex((x) => x.userId === userModel.user.id);
                if (currUserIndex !== -1) {
                    currSelects.splice(currUserIndex, 1);
                }
            }
        }
    }

    public static changedCursor(select: IRealtimeSelect, currSocket: Socket): void {
        const currSelects = CursorUpdatedHandler.cursorList.getSelectList(select.postHash);

        const roomId = `POST_${select.postHash}`;

        const currUserIndex = currSelects.findIndex((x) => x.userId === select.userId);

        if (select.active) {
            if (currUserIndex === -1) {
                while (true) {

                    const userModel = validateAccessToken(currSocket.request.cookies["token"]);

                    select.color = randomColor({
                        luminosity: "bright",
                        alpha: 0.1
                    });
                    select.userId = userModel.user.id;
                    select.userName = userModel.user.firstname;

                    const index = currSelects.findIndex((x) => x.color === select.color);
                    if (index === -1) {
                        break;
                    }
                }

                currSelects.push(select);
            } else {
                currSelects[currUserIndex] = select;
            }
        } else if (currUserIndex !== -1) {
            currSelects.splice(currUserIndex, 1);
        }


        const response = new ServerCursorUpdated(select, () => {});
        io.to(roomId).emit(response.URL, response);
    }
}
