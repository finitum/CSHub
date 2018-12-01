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

    public static changedCursor(select: IRealtimeSelect, currSocket: Socket): void {
        const currSelects = CursorUpdatedHandler.cursorList.getSelectList(select.postHash);

        const roomId = `POST_${select.postHash}`;

        let userAlreadyExists = false;

        if (select.userId !== null) {
            for (let currSelect of currSelects) {
                if (currSelect.userId === select.userId) {
                    currSelect = select;
                    userAlreadyExists = true;
                    break;
                }
            }
        }

        if (!userAlreadyExists) {
            while (true) {

                const userModel = validateAccessToken(currSocket.request.cookies["token"]);

                select.color = randomColor();
                select.userId = userModel.user.id;
                select.userName = userModel.user.firstname;

                const index = currSelects.findIndex((x) => x.color === select.color);
                if (index === -1) {
                    break;
                }
            }

            currSelects.push(select);
        }

        const response = new ServerCursorUpdated(select, () => {});
        io.to(roomId).emit(response.URL, response);
    }
}