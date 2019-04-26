import {IApiRequest} from "../../models";
import {ITopic} from "../../models";

import {Requests} from "../Requests";

export class GetTopicsCallBack {

    constructor(
        public topics?: ITopic[],
        public version?: number
    ) {}
}

export class GetTopics implements IApiRequest {

    public static getURL: string = Requests.TOPICS;
    public URL: string = GetTopics.getURL;

    constructor(public topicVersion: number) {}
}
