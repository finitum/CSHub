import {PostHistory} from "./PostHistory";
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

export class EditDataHandler {

    private static postHistoryHandler = new PostHistory();

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
        const currEdits = EditDataHandler.postHistoryHandler.getEditList(edit.postHash);

        this.getPreviousEditHash(edit.postHash, currEdits)
            .then((previousEditHash: number) => {
                let operationalDelta: Delta = null;

                if (currEdits.length !== 0 && edit.previousEditHash !== previousEditHash) {
                    // TODO operational transform
                }

                const editHash = Math.floor(Math.random() * (9999999999 - 1000000001)) + 1000000000;
                EditDataHandler.postHistoryHandler.addPostEdit({
                    ...edit,
                    editHash,
                    previousEditHash
                });

                let serverEdit: IRealtimeEdit;
                if (operationalDelta !== null) {
                    serverEdit = {
                        postHash: edit.postHash,
                        delta: operationalDelta,
                        timestamp: dayjs(),
                        editHash,
                        previousEditHash
                    }
                } else {
                    serverEdit = {
                        postHash: edit.postHash,
                        delta: edit.delta,
                        timestamp: dayjs(),
                        editHash,
                        previousEditHash
                    }
                }
                console.log(serverEdit);

                const roomId = `POST_${edit.postHash}`;

                currSocket.leave(roomId);
                const response = new ServerDataUpdated(serverEdit, () => {});
                io.to(roomId).emit(response.URL, response);
                currSocket.join(roomId);
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

                if (currentExtraEdits.length > 0) {

                    for (let i = currentExtraEdits.length - 1; i >= 0; i--) {
                        const currExtraEdit = currentExtraEdits[i];

                        composedDelta = composedDelta.compose(new Delta(currExtraEdit.delta));
                    }

                    previousEditHash = currentExtraEdits[0].previousEditHash;
                    editHash = currentExtraEdits[0].editHash;
                    lastTimestamp = currentExtraEdits[0].timestamp;
                } else {
                    editHash = dbEdits[dbEdits.length - 1].editHash;
                    lastTimestamp = dbEdits[dbEdits.length - 1].datetime;
                }

                const returnedValue: IRealtimeEdit = {
                    postHash,
                    delta: composedDelta,
                    timestamp: lastTimestamp,
                    editHash,
                    previousEditHash
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