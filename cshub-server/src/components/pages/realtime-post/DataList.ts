import {IRealtimeEdit} from "../../../../../cshub-shared/src/api-calls/realtime-edit";
import {DatabaseResultSet, query} from "../../../utilities/DatabaseConnection";
import Delta = require("quill-delta/dist/Delta");
import {transformFromArray} from "../../../../../cshub-shared/src/utilities/Transform";

type editObjectType = {
    edits: IRealtimeEdit[],
    editsSinceDb: number
};

export class DataList {

    private readonly editObj: { [postId: number]: editObjectType } = {};

    public addPost(postHash: number) {
        this.editObj[postHash] = {edits: [], editsSinceDb: 0};
    }

    public addPostEdit(edit: IRealtimeEdit) {
        const editList = this.getEditList(edit.postHash);

        editList.edits.push(edit);

        const newAmountOfEdits = ++editList.editsSinceDb;

        if (newAmountOfEdits > 9) {
            const currLength = editList.edits.length;
            const editListSpliced = editList.edits.slice(currLength - newAmountOfEdits, currLength - 1);
            this.addEditsToDatabase(edit.postHash, editListSpliced);
        }
    }

    public transformArray(newEdit: IRealtimeEdit, newEditHasPriority: boolean): Delta {
        const edits = this.getEditList(newEdit.postHash).edits;
        if (edits.length > 0) {
            return transformFromArray(edits, newEdit, newEditHasPriority);
        } else {
            return new Delta();
        }
    }

    public getAllEditsSinceDB(postHash: number, dbHash: number): IRealtimeEdit[] {

        const currentEditList = this.getEditList(postHash).edits;
        const currentExtraEdits: IRealtimeEdit[] = [];

        for (let j = currentEditList.length - 1; j >= 0; j--) {
            const currEdit = currentEditList[j];

            currentExtraEdits.push(currEdit);

            if (currEdit.previousEditHash === dbHash) {
                break;
            }
        }

        return currentExtraEdits;

    }

    public getPreviousEditHash(postHash: number): Promise<number> {
        const currEdits = this.getEditList(postHash).edits;
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
            return new Promise((resolve, reject) => {
                resolve(currEdits[currEdits.length - 1].editHash);
            });
        }
    }

    private addEditsToDatabase(postHash: number, toAdd: IRealtimeEdit[]) {

        let composedDelta = toAdd[0].delta;

        for (const edit of toAdd) {
            composedDelta = composedDelta.compose(edit.delta);
        }

        query(`
            
        `)
    }

    private getEditList(postHash: number): editObjectType {
        if (this.editObj.hasOwnProperty(postHash)) {
            return this.editObj[postHash];
        } else {
            this.addPost(postHash);
            return {edits: null, editsSinceDb: null};
        }
    }

}