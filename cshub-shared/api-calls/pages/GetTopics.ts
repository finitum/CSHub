import {IApiRequest} from "../../models/IApiRequest";
import {IPost} from "../../models/IPost";
import {ITopic} from "../../models/ITopic";

import {NonAuthRequests} from "../NonAuthRequests";

export class GetTopicsCallBack {

    constructor(
        public topics?: ITopic[],
        public version?: number
    ) {}
}

export class GetTopics implements IApiRequest {

    public static getURL: string = NonAuthRequests.TOPICS;
    public URL: string = GetTopics.getURL;

    constructor(public topicVersion: number) {}
}
