import {IRealtimeEdit} from "../../../../../cshub-shared/src/api-calls/realtime-edit";
import {query} from "../../../utilities/DatabaseConnection";
import logger from "../../../utilities/Logger"
import Delta = require("quill-delta/dist/Delta");
import {transformFromArray} from "../../../../../cshub-shared/src/utilities/DeltaHandler";
import async from "async";
import {DataUpdatedHandler} from "./DataUpdatedHandler";

type queueType = {
    toAdd: IRealtimeEdit[],
    fullList: IRealtimeEdit[],
    isAsyncRunning: boolean,
    currComposedDelta: Delta,
    dbComposedDelta: Delta
}

export class DataList {

    private readonly editQueues: { [postId: number]: queueType } = {};

    public addPost(postHash: number) {

        return Promise.resolve(DataUpdatedHandler.getOldAndNewDeltas(postHash)
            .then((deltas) => {
                this.editQueues[postHash] = {
                    toAdd: [],
                    fullList: [],
                    isAsyncRunning: false,
                    currComposedDelta: null,
                    dbComposedDelta: null
                };

                this.editQueues[postHash].currComposedDelta = deltas.fullDelta;
                this.editQueues[postHash].dbComposedDelta = deltas.oldDelta;
            }));
    }

    public async addPostEdit(newEdit: IRealtimeEdit) {

        this.getTodoQueue(newEdit.postHash)
            .then(async (queue) => {
                if (queue === null) {
                    await this.addPost(newEdit.postHash);
                    this.addPostEdit(newEdit);
                } else {
                    queue.toAdd.push(newEdit);
                    queue.fullList.push(newEdit);

                    if (!queue.isAsyncRunning) {
                        queue.isAsyncRunning = true;

                        async.whilst(
                            () => queue.toAdd.length !== 0,
                            (next) => {

                                const currRecord = queue.toAdd[0];

                                if (queue.currComposedDelta === null) {
                                    DataUpdatedHandler.getOldAndNewDeltas(currRecord.postHash)
                                        .then((deltas) => {
                                            queue.currComposedDelta = deltas.fullDelta;
                                            queue.dbComposedDelta = deltas.oldDelta;
                                            this.handleSave(next, queue);
                                        });
                                } else {
                                    this.handleSave(next, queue);
                                }
                            }, () => {
                                queue.isAsyncRunning = false;
                            });
                    }

                    if (queue.fullList.length > 10) {
                        queue.fullList.splice(0, queue.fullList.length - 11);
                    }
                }
            });
    }

    private handleSave(next: () => void, queue: queueType): void {

        const currRecord = queue.toAdd[0];

        new Promise(resolve => resolve())
            .then(() => {

                try {
                    const op = queue.currComposedDelta.ops[queue.currComposedDelta.ops.length - 1];
                    const diff = queue.currComposedDelta.diff(queue.dbComposedDelta);

                    if (typeof op !== "undefined" && !(op.insert === "\n" || op.insert.toString().endsWith("\n"))) {
                        queue.currComposedDelta.ops.push({insert: "\n"});
                    }

                    queue.currComposedDelta = queue.currComposedDelta.compose(new Delta(currRecord.delta));

                    const toBeSavedEdit = queue.dbComposedDelta.diff(queue.currComposedDelta);

                    if (diff.ops.length === 0) {
                        return query(`
                          INSERT INTO edits
                          SET post     = (
                            SELECT id
                            FROM posts
                            WHERE hash = ?
                          ),
                              content  = ?,
                              datetime = NOW()
                        `, currRecord.postHash, JSON.stringify(toBeSavedEdit))
                            .then(() => {
                                return this.insertUserIntoEdit(currRecord.postHash, currRecord.userId);
                            })
                    } else {
                        return query(`
                          UPDATE edits
                            INNER JOIN posts ON edits.post = posts.id
                          SET edits.content = ?
                          WHERE edits.approved = 0
                            AND posts.hash = ?
                          ORDER BY edits.datetime DESC
                          LIMIT 1
                        `, JSON.stringify(toBeSavedEdit), currRecord.postHash)
                            .then(() => {
                                return this.insertUserIntoEdit(currRecord.postHash, currRecord.userId);
                            })
                    }
                } catch (e) {
                    logger.error("Error with saving realtime edit");
                    logger.error(e);
                    return null; // NOOP
                }
            })
            .then(() => {
                queue.toAdd.shift();
                logger.verbose(`DONE inserting edit from time ${currRecord.timestamp} and user ${currRecord.userId} with id ${currRecord.userGeneratedId} and delta ${JSON.stringify(currRecord.delta)}`);
                next();
            });
    }

    private insertUserIntoEdit(postHash: number, userId: number) {
        return query(`
          INSERT INTO editusers
          SET edit = (
            SELECT id
            FROM edits
            WHERE post = (
              SELECT id
              FROM posts
              WHERE hash = ?
            )
              AND approved = 0
          ),
              user = ?
          ON DUPLICATE KEY UPDATE user=user;
        `, postHash, userId)
            .catch((e) => {
                logger.error("Inserting into edituser failed");
                logger.error(e);
            });
    }

    public updateDbDelta(postHash: number, newDelta: Delta) {
        this.getTodoQueue(postHash)
            .then((queue) => {
                queue.dbComposedDelta = newDelta;
            })
    }

    public transformArray(newEdit: IRealtimeEdit, newEditHasPriority: boolean): Promise<Delta> {
        return this.getEditQueue(newEdit.postHash)
            .then((editQueue) => {
                if (editQueue.length > 0) {
                    return transformFromArray(editQueue, newEdit, newEditHasPriority);
                } else {
                    return new Delta();
                }
            });

    }

    public getPreviousServerID(postHash: number): Promise<number> {
        return this.getEditQueue(postHash)
            .then((currQueue) => {
                if (currQueue.length === 0) {
                    return -1;
                } else {
                    return currQueue[currQueue.length - 1].serverGeneratedId;
                }
            });

    }

    public getPreviousServerIDOfUser(postHash: number, userId: number): Promise<number> {
        return this.getEditQueue(postHash)
            .then((currQueue) => {
                if (currQueue.length === 0) {
                    return -1;
                } else {
                    for (let i = currQueue.length - 1; i >= 0; i--) {
                        if (currQueue[i].userId === userId) {
                            return currQueue[i].serverGeneratedId;
                        }
                    }
                    return this.getPreviousServerID(postHash);
                }
            });

    }

    private async getEditQueue(postHash: number): Promise<IRealtimeEdit[]> {
        if (this.editQueues.hasOwnProperty(postHash)) {
            return this.editQueues[postHash].fullList;
        } else {
            await this.addPost(postHash);
            return this.getEditQueue(postHash);
        }
    }

    private async getTodoQueue(postHash: number): Promise<queueType> {
        if (this.editQueues.hasOwnProperty(postHash)) {
            return this.editQueues[postHash];
        } else {
            await this.addPost(postHash);
            return this.getTodoQueue(postHash);
        }
    }
}
