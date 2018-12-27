import {DataList} from "./DataList";
import {Socket} from "socket.io";
import {
    ServerDataUpdated,
    IRealtimeEdit
} from "../../../../../cshub-shared/src/api-calls";
import dayjs, {Dayjs} from "dayjs";
// @ts-ignore
import Delta from "quill-delta/dist/Delta";
import {DatabaseResultSet, query} from "../../../utilities/DatabaseConnection";
import {logger} from "../../../index";
import {io} from "./socket-receiver";
import {validateAccessToken} from "../../../auth/JWTHandler";
import {getRandomNumberLarge} from "../../../../../cshub-shared/src/utilities/Random";

export class DataUpdatedHandler {

    private static postHistoryHandler = new DataList();

    public static applyNewEdit(edit: IRealtimeEdit, currSocket: Socket): void {
        const previousServerId = this.postHistoryHandler.getPreviousServerID(edit.postHash);

        let operationalDelta: Delta = null;

        if (edit.prevServerGeneratedId !== previousServerId && previousServerId != -1) {
            edit.delta = this.postHistoryHandler.transformArray(edit, false);
        }

        const serverGeneratedIdentifier = getRandomNumberLarge();
        DataUpdatedHandler.postHistoryHandler.addPostEdit({
            ...edit,
            serverGeneratedId: serverGeneratedIdentifier,
            prevServerGeneratedId: previousServerId
        });

        const userModel = validateAccessToken(currSocket.request.cookies["token"]);

        let serverEdit: IRealtimeEdit = {
            postHash: edit.postHash,
            delta: null,
            timestamp: dayjs(),
            serverGeneratedId: serverGeneratedIdentifier,
            prevServerGeneratedId: previousServerId,
            userId: userModel.user.id,
            userGeneratedId: edit.userGeneratedId
        };

        if (operationalDelta !== null) {
            serverEdit = {
                ...serverEdit,
                delta: operationalDelta
            }
        } else {
            serverEdit = {
                ...serverEdit,
                delta: edit.delta
            }
        }

        const roomId = `POST_${edit.postHash}`;

        const response = new ServerDataUpdated(serverEdit);
        io.to(roomId).emit(response.URL, response);
    }

    public static getCurrentPostData(postHash: number): Promise<IRealtimeEdit> {
        return query(`
          SELECT T1.content,
                 T1.datetime
          FROM edits T1
                 INNER JOIN posts T2 ON T1.post = T2.id
          WHERE T2.hash = ?
          ORDER BY T1.datetime ASC
        `, postHash)
            .then((edits: DatabaseResultSet) => {

                const dbEdits: Array<{content: Delta, datetime: Dayjs}> = [];

                for (const editObj of edits.convertRowsToResultObjects()) {
                    dbEdits.push({
                        content: JSON.parse(editObj.getStringFromDB("content")),
                        datetime: dayjs(editObj.getStringFromDB("datetime"))
                    });
                }

                let composedDelta: Delta = null;
                for (const dbEdit of dbEdits) {
                    if (composedDelta === null) {
                        composedDelta = new Delta(dbEdit.content);
                    } else {
                        composedDelta.compose(new Delta(dbEdit.content));
                    }
                }

                const lastTimestamp: Dayjs = dbEdits[dbEdits.length - 1].datetime;

                const returnedValue: IRealtimeEdit = {
                    postHash,
                    delta: composedDelta,
                    timestamp: lastTimestamp,
                    serverGeneratedId: null,
                    prevServerGeneratedId: null,
                    userGeneratedId: null
                };

                return returnedValue;
            })
            .catch(err => {
                logger.error(`Getting current post data failed`);
                logger.error(err);
                return null;
            });
    }
}