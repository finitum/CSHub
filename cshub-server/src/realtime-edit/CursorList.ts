import { IRealtimeSelect } from "../../../cshub-shared/src/api-calls";

export class CursorList {
    private readonly selectObj: { [postId: number]: IRealtimeSelect[] } = {};

    public addPost(postHash: number): void {
        this.selectObj[postHash] = [];
    }

    public getSelectList(postHash: number): IRealtimeSelect[] {
        if (Object.prototype.hasOwnProperty.call(this.selectObj, postHash)) {
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
