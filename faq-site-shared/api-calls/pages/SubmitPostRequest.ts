import {IApiRequest} from "../../models/IApiRequest";

import {AuthRequests} from "../AuthRequests";

export enum SubmitPostResponse {
    SUCCESS,
    TITLEALREADYINUSE,
    INVALIDINPUT
}

export class SubmitPostCallback {

    constructor(
        public response: SubmitPostResponse,
        public postHash?: number
    ) {}
}

export class SubmitPostRequest implements IApiRequest {

    public static getURL: string = AuthRequests.SUBMITPOST;
    public URL: string = SubmitPostRequest.getURL;

    constructor(
        public postTitle: string,
        public postBody: object,
        public postTopicHash: number
    ) {}
}
