import {IRealtimeSelect} from "../../../cshub-shared/src/api-calls";

export class CursorList {

    private readonly selectObj: {[postId: number]: IRealtimeSelect[]} = {};

    public addPost(postHash: number) {
        this.selectObj[postHash] = [];
    }

    public getSelectList(postHash: number): IRealtimeSelect[] {
        if (this.selectObj.hasOwnProperty(postHash)) {
            return this.selectObj[postHash];
        } else {
            this.addPost(postHash);
            return [];
        }
    }

    public addPostCursor(select: IRealtimeSelect): number {
        const newLength = this.getSelectList(select.postHash).push(select);
        return newLength - 1;
    }

}
