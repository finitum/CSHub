import {IApiRequest} from "../../models/IApiRequest";

import {Requests} from "../Requests";

export enum CreateTopicResponseTypes {
    SUCCESS,
    TITLEALREADYINUSE,
    INVALIDINPUT
}

export class CreateTopicCallback {

    constructor(
        public response: CreateTopicResponseTypes
    ) {}
}

export class CreateTopic implements IApiRequest {

    public static getURL: string = Requests.SUBMITTOPIC;
    public URL: string = CreateTopic.getURL;

    constructor(
        public topicTitle: string,
        public topicParentHash: number
    ) {}
}
