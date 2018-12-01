import {IUserEdit} from "../../../../../cshub-shared/src/api-calls/realtime-edit";
import {IEditWithHash} from "./IEditWithHash";

export class PostHistory {

    private readonly editObj: {[postId: number]: IEditWithHash[]} = {};

    public addPost(postHash: number) {
        this.editObj[postHash] = [];
    }

    public getEditList(postHash: number): IEditWithHash[] {
        if (this.editObj.hasOwnProperty(postHash)) {
            return this.editObj[postHash];
        } else {
            this.addPost(postHash);
            return [];
        }
    }

    public addPostEdit(edit: IEditWithHash): number {
        const newLength = this.getEditList(edit.edit.postHash).push(edit);
        return newLength - 1;
    }

}