import {IApiRequest} from "../../models/IApiRequest";

import {Requests} from "../Requests";
import Delta from "quill-delta/dist/Delta";

export enum SubmitPostResponse {
    SUCCESS,
    TITLEALREADYINUSE,
    INVALIDINPUT
}

export class CreatePostCallback {

    constructor(
        public response: SubmitPostResponse,
        public postHash?: number
    ) {}
}

export class CreatePost implements IApiRequest {

    public static getURL: string = Requests.SUBMITPOST;
    public URL: string = CreatePost.getURL;

    constructor(
        public postTitle: string,
        public postTopicHash: number
    ) {}
}
