import {IApiRequest} from "../../models/IApiRequest";

import {AuthRequests} from "../AuthRequests";
// @ts-ignore
import Delta from "quill-delta/dist/Delta";

export class EditPostCallback {
}

export class EditPost implements IApiRequest {

    public static getURL: string = AuthRequests.EDITPOST;
    public URL: string = EditPost.getURL;

    constructor(
        public postHash: number,
        public content: {
            delta: Delta,
            html: string
        },
        public postTitle: string,
        public postTopicHash: number
    ) {}
}
