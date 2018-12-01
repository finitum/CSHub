import {IRealtimeEdit} from "../../../../../cshub-shared/src/api-calls/realtime-edit";

export class PostHistory {

    private readonly editObj: {[postId: number]: IRealtimeEdit[]} = {};

    public addPost(postHash: number) {
        this.editObj[postHash] = [];
    }

    public getEditList(postHash: number): IRealtimeEdit[] {
        if (this.editObj.hasOwnProperty(postHash)) {
            return this.editObj[postHash];
        } else {
            this.addPost(postHash);
            return [];
        }
    }

    public addPostEdit(edit: IRealtimeEdit): number {
        const newLength = this.getEditList(edit.postHash).push(edit);
        return newLength - 1;
    }

}