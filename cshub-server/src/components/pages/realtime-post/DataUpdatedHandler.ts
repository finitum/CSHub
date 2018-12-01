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
import {transformFromArray} from "../../../../../cshub-shared/src/utilities/Transform";

export class DataUpdatedHandler {

    private static postHistoryHandler = new DataList();

    private static getPreviousEditHash(postHash: number, currEdits: IRealtimeEdit[]): Promise<number> {
        if (currEdits.length === 0) {
            return query(`
              SELECT T1.content,
                     T1.editHash,
                     T1.datetime
              FROM edits T1
                     INNER JOIN posts T2 ON T1.post = T2.id
              WHERE T2.hash = ?
              ORDER BY T1.datetime DESC
              LIMIT 1
            `, postHash)
                .then((edit: DatabaseResultSet) => {
                    return edit.getNumberFromDB("editHash");
                })
        } else {
            return new Promise((resolve, reject) => { resolve(currEdits[currEdits.length - 1].editHash); });
        }
    }

    public static applyNewEdit(edit: IRealtimeEdit, currSocket: Socket): void {
        const currEdits = DataUpdatedHandler.postHistoryHandler.getEditList(edit.postHash);

        this.getPreviousEditHash(edit.postHash, currEdits)
            .then((previousEditHash: number) => {
                let operationalDelta: Delta = null;

                if (currEdits.length !== 0 && edit.previousEditHash !== previousEditHash) {
                    edit.delta = transformFromArray(currEdits, edit, false);
                }

                const editHash = getRandomNumberLarge();
                DataUpdatedHandler.postHistoryHandler.addPostEdit({
                    ...edit,
                    editHash,
                    previousEditHash
                });

                const userModel = validateAccessToken(currSocket.request.cookies["token"]);

                let serverEdit: IRealtimeEdit = {
                    postHash: edit.postHash,
                    delta: null,
                    timestamp: dayjs(),
                    editHash,
                    previousEditHash,
                    userId: userModel.user.id,
                    userGeneratedIdentifier: edit.userGeneratedIdentifier
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

                const response = new ServerDataUpdated(serverEdit, () => {});
                io.to(roomId).emit(response.URL, response);
            });
    }

    public static getCurrentPostData(postHash: number): Promise<IRealtimeEdit> {
        return query(`
          SELECT T1.content,
                 T1.editHash,
                 T1.datetime
          FROM edits T1
                 INNER JOIN posts T2 ON T1.post = T2.id
          WHERE T2.hash = ?
          ORDER BY T1.datetime ASC
        `, postHash)
            .then((edits: DatabaseResultSet) => {

                const dbEdits: Array<{content: Delta, editHash: number, datetime: Dayjs}> = [];

                for (const editObj of edits.convertRowsToResultObjects()) {
                    dbEdits.push({
                        content: JSON.parse(editObj.getStringFromDB("content")),
                        editHash: editObj.getNumberFromDB("editHash"),
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

                const lastDbEditHash = dbEdits[dbEdits.length - 1].editHash;

                const currentEditList = this.postHistoryHandler.getEditList(postHash);
                const currentExtraEdits: IRealtimeEdit[] = [];

                for (let j = currentEditList.length - 1; j >= 0; j--) {
                    const currEdit = currentEditList[j];

                    currentExtraEdits.push(currEdit);

                    if (currEdit.previousEditHash === lastDbEditHash) {
                        break;
                    }
                }

                let lastTimestamp: Dayjs;
                let editHash: number;
                let previousEditHash: number;
                let userGeneratedIdentifier: number;

                if (currentExtraEdits.length > 0) {

                    for (let i = currentExtraEdits.length - 1; i >= 0; i--) {
                        const currExtraEdit = currentExtraEdits[i];

                        composedDelta = composedDelta.compose(new Delta(currExtraEdit.delta));
                    }

                    previousEditHash = currentExtraEdits[0].previousEditHash;
                    userGeneratedIdentifier = currentExtraEdits[0].userGeneratedIdentifier;
                    editHash = currentExtraEdits[0].editHash;
                    lastTimestamp = currentExtraEdits[0].timestamp;
                } else {
                    editHash = dbEdits[dbEdits.length - 1].editHash;
                    lastTimestamp = dbEdits[dbEdits.length - 1].datetime;
                    userGeneratedIdentifier = getRandomNumberLarge();
                }

                const returnedValue: IRealtimeEdit = {
                    postHash,
                    delta: composedDelta,
                    timestamp: lastTimestamp,
                    editHash,
                    previousEditHash,
                    userGeneratedIdentifier
                };

                return returnedValue;
            })
            .catch(err => {
                logger.error(`Editing failed`);
                logger.error(err);
                return null;
            });
    }
}