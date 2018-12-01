import {PostHistory} from "./PostHistory";
import {Socket} from "socket.io";
import {
    IServerEdit,
    ServerDataUpdated,
    IUserEdit
} from "../../../../../cshub-shared/src/api-calls";
import dayjs, {Dayjs} from "dayjs";
// @ts-ignore
import Delta from "quill-delta/dist/Delta";
import {DatabaseResultSet, query} from "../../../utilities/DatabaseConnection";
import {logger} from "../../../index";

export class EditDataHandler {

    private static postHistoryHandler = new PostHistory();

    public static applyNewEdit(edit: IUserEdit, currSocket: Socket): void {
        const currEdits = EditDataHandler.postHistoryHandler.getEditList(edit.postHash);

        let operationalDelta: Delta = null;
        if (edit.lastServerId !== currEdits.length - 1) {
            // TODO operational transform
        }

        const editHash = Math.floor(Math.random() * (9999999999 - 1000000001)) + 1000000000;
        const newIndex = EditDataHandler.postHistoryHandler.addPostEdit({edit, hash: editHash});

        let serverEdit: IServerEdit;
        if (operationalDelta !== null) {
            serverEdit = {
                delta: operationalDelta,
                timestamp: dayjs(),
                serverId: newIndex
            }
        } else {
            serverEdit = {
                delta: edit.delta,
                timestamp: dayjs(),
                serverId: newIndex
            }
        }
        console.log(currEdits);

        const roomId = `POST_${edit.postHash}`;

        currSocket.leave(roomId);
        const response = new ServerDataUpdated(serverEdit, () => {
        });
        currSocket.to(roomId).emit(response.URL, response);
        currSocket.join(roomId);
    }

    public static getCurrentPostData(postHash: number): Promise<IServerEdit> {
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
                const currentExtraEdits: IUserEdit[] = [];

                for (let j = currentEditList.length - 1; j >= 0; j--) {
                    const currEdit = currentEditList[j];

                    currentExtraEdits.push(currEdit.edit);

                    if (currEdit.hash === lastDbEditHash) {
                        break;
                    }
                }

                let lastTimestamp: Dayjs;
                const serverId = currentEditList.length - 1;
                if (currentExtraEdits.length > 0) {
                    for (let i = currentExtraEdits.length - 1; i >= 0; i--) {
                        const currExtraEdit = currentExtraEdits[i];

                        composedDelta.compose(currExtraEdit.delta);
                    }

                    lastTimestamp = currentExtraEdits[0].timestamp;
                } else {
                    lastTimestamp = dbEdits[dbEdits.length - 1].datetime;
                }

                return {
                    delta: composedDelta,
                    timestamp: lastTimestamp,
                    serverId
                };
            })
            .catch(err => {
                logger.error(`Editing failed`);
                logger.error(err);
                return null;
            });
    }
}