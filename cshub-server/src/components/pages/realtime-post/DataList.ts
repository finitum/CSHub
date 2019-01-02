import {IRealtimeEdit} from "../../../../../cshub-shared/src/api-calls/realtime-edit";
import {DatabaseResultSet, query} from "../../../utilities/DatabaseConnection";
import Delta = require("quill-delta/dist/Delta");
import {transformFromArray} from "../../../../../cshub-shared/src/utilities/Transform";
import async, {AsyncFunction} from "async";
import {logger} from "../../../index";
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
        this.editQueues[postHash] = {
            toAdd: [],
            fullList: [],
            isAsyncRunning: false,
            currComposedDelta: null,
            dbComposedDelta: null
        };
    }

    public addPostEdit(newEdit: IRealtimeEdit) {

        const queue = this.getTodoQueue(newEdit.postHash);
        queue.toAdd.push(newEdit);
        queue.fullList.push(newEdit);

        logger.info(`RECEIVING edit from ${newEdit.timestamp} with id ${newEdit.userGeneratedId} and delta ${JSON.stringify(newEdit.delta)} or deltas ${JSON.stringify(newEdit.deltas)}`);

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
    }

    private handleSave(next: () => void, queue: queueType): void {

        const currRecord = queue.toAdd[0];

        logger.info(`STARTING inserting edit from ${currRecord.timestamp} with id ${currRecord.userGeneratedId} and delta ${JSON.stringify(currRecord.delta)} or deltas ${JSON.stringify(currRecord.deltas)}`);

        new Promise(resolve => resolve())
            .then(() => {

                const diff = queue.currComposedDelta.diff(queue.dbComposedDelta);

                if (currRecord.delta !== null && typeof currRecord.delta !== "undefined") {
                    queue.currComposedDelta = queue.currComposedDelta.compose(new Delta(currRecord.delta));
                } else if (currRecord.deltas !== null && typeof currRecord.deltas !== "undefined") {
                    for (const delta of currRecord.deltas) {
                        queue.currComposedDelta = queue.currComposedDelta.compose(new Delta(delta));
                    }
                }

                try {
                    const toBeSavedEdit = queue.dbComposedDelta.diff(queue.currComposedDelta);

                    logger.info(`ONGOING inserting edit from ${currRecord.timestamp} with id ${currRecord.userGeneratedId} and diff ${JSON.stringify(toBeSavedEdit)}`);

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
                    } else {
                        return query(`
                          UPDATE edits
                            INNER JOIN posts ON edits.post = posts.id
                          SET edits.content = ?
                          WHERE edits.approved = 0
                          ORDER BY edits.datetime DESC
                          LIMIT 1
                        `, JSON.stringify(toBeSavedEdit))
                    }
                } catch (e) {
                    logger.error("Error with saving realtime edit");
                    logger.error(e);
                    return null; // NOOP
                }


            })
            .then(() => {
                queue.toAdd.shift();
                logger.info(`DONE inserting edit from ${currRecord.timestamp} with id ${currRecord.userGeneratedId} and delta ${JSON.stringify(currRecord.delta)} or deltas ${JSON.stringify(currRecord.deltas)}`);
                next();
            });
    }

    public updateDbDelta(postHash: number, newDelta: Delta) {
        this.getTodoQueue(postHash).dbComposedDelta = newDelta;
    }

    public transformArray(newEdit: IRealtimeEdit, newEditHasPriority: boolean): Delta {
        const editQueue = this.getEditQueue(newEdit.postHash);
        if (editQueue.length > 0) {
            return transformFromArray(editQueue, newEdit, newEditHasPriority);
        } else {
            return new Delta();
        }
    }

    public getPreviousServerID(postHash: number): number {
        const currQueue = this.getEditQueue(postHash);
        if (currQueue.length === 0) {
            return -1;
        } else {
            return currQueue[currQueue.length - 1].serverGeneratedId;
        }
    }

    private getEditQueue(postHash: number): IRealtimeEdit[] {
        if (this.editQueues.hasOwnProperty(postHash)) {
            return this.editQueues[postHash].fullList;
        } else {
            this.addPost(postHash);
            return [];
        }
    }

    private getTodoQueue(postHash: number): queueType {
        if (this.editQueues.hasOwnProperty(postHash)) {
            return this.editQueues[postHash];
        } else {
            this.addPost(postHash);
            return null;
        }
    }
}