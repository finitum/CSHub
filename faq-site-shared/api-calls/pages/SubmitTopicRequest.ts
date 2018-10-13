import {IApiRequest} from "../../models/IApiRequest";

import {AdminRequests} from "../AdminRequests";

export enum SubmitTopicResponse {
    SUCCESS,
    TITLEALREADYINUSE,
    INVALIDINPUT
}

export class SubmitTopicCallback {

    constructor(
        public response: SubmitTopicResponse
    ) {}
}

export class SubmitTopicRequest implements IApiRequest {

    public static getURL: string = AdminRequests.SUBMITTOPIC;
    public URL: string = SubmitTopicRequest.getURL;

    constructor(
        public topicTitle: string,
        public topicParentHash: number
    ) {}
}
