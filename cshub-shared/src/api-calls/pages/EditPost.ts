import {IApiRequest} from "../../models/IApiRequest";

import {Requests} from "../Requests";
// @ts-ignore
import Delta from "quill-delta/dist/Delta";

export enum EditPostReturnTypes {
    SUCCESS,
    NOTHINGTOUPDATE
}

export class EditPostCallback {
    constructor(public result: EditPostReturnTypes) {}
}

export class EditPost implements IApiRequest {

    public static getURL: string = Requests.EDITPOST;
    public URL: string = EditPost.getURL;

    constructor(
        public postHash: number,
        public postTitle: string,
        public postTopicHash: number
    ) {}
}
