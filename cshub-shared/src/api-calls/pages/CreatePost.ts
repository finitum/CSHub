import {IApiRequest} from "../../models/IApiRequest";

import {Requests} from "../Requests";

export enum SubmitPostResponse {
    SUCCESS,
    TITLEALREADYINUSE,
    INVALIDINPUT,
    ALREADYHASINDEX
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
        public postTopicHash: number,
        public isIndex: boolean
    ) {}
}
