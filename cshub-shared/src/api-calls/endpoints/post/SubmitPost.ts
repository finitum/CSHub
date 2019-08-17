import { IApiRequest } from "../../../models";

import { Requests } from "../../Requests";

export enum SubmitPostResponse {
    SUCCESS,
    TITLEALREADYINUSE,
    INVALIDINPUT,
    ALREADYHASINDEX
}

export class CreatePostCallback {
    constructor(public response: SubmitPostResponse, public postHash?: number) {}
}

export class SubmitPost implements IApiRequest<CreatePostCallback> {
    public static getURL: string = Requests.SUBMITPOST;
    public URL: string = SubmitPost.getURL;

    constructor(public postTitle: string, public postTopicHash: number, public isIndex: boolean) {}
}
