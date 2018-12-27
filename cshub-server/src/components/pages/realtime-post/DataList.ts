import {IRealtimeEdit} from "../../../../../cshub-shared/src/api-calls/realtime-edit";
import {DatabaseResultSet, query} from "../../../utilities/DatabaseConnection";
import Delta = require("quill-delta/dist/Delta");
import {transformFromArray} from "../../../../../cshub-shared/src/utilities/Transform";
import async from "async";
import {logger} from "../../../index";

export class DataList {

    private readonly editQueues: { [postId: number]: IRealtimeEdit[] } = {};

    public addPost(postHash: number) {
        this.editQueues[postHash] = [];
    }

    public addPostEdit(newEdit: IRealtimeEdit) {

        const editQueue = this.getEditQueue(newEdit.postHash);
        editQueue.push(newEdit);

        async.eachSeries(editQueue, (currRecord, next) => {
            logger.info("Inserting edit");
            query(`
              SELECT T1.content
              FROM edits T1
                     INNER JOIN posts T2 ON T1.post = T2.id
              WHERE T2.hash = ?
                AND approved = 0
              ORDER BY T1.datetime DESC
              LIMIT 1
            `, newEdit.postHash)
                .then((edit: DatabaseResultSet) => {
                    let content = null;

                    if (edit.getRows().length !== 0) {
                        content = edit.getStringFromDB("content");
                    }

                    let composedDelta = null;
                    if (content == null) {
                        composedDelta = newEdit.delta;
                        return query(`
                          INSERT INTO edits
                          SET post     = (
                            SELECT id
                            FROM posts
                            WHERE hash = ?
                          ),
                              content  = ?,
                              datetime = NOW()
                        `, newEdit.postHash, JSON.stringify(composedDelta))
                    } else {
                        const lastDelta = new Delta(JSON.parse(content));
                        composedDelta = lastDelta.compose(newEdit.delta);
                        return query(`
                          UPDATE edits
                            INNER JOIN posts ON edits.post = posts.id
                          SET edits.content = ?
                          WHERE edits.approved = 0
                          ORDER BY edits.datetime DESC
                          LIMIT 1
                        `, JSON.stringify(composedDelta))
                    }

                })
                .then(() => {
                    next();
                });
        });
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
            currQueue[currQueue.length - 1].serverGeneratedId;
        }
    }

    private getEditQueue(postHash: number): IRealtimeEdit[] {
        if (this.editQueues.hasOwnProperty(postHash)) {
            return this.editQueues[postHash];
        } else {
            this.addPost(postHash);
            return [];
        }
    }

}