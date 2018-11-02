import {IApiRequest} from "../../models/IApiRequest";
import {IPost} from "../../models/IPost";
import {ITopic} from "../../models/ITopic";

import {NonAuthRequests} from "../NonAuthRequests";

export class TopicsCallBack {

    constructor(
        public topics?: ITopic[],
        public version?: number
    ) {}
}

export class TopicsRequest implements IApiRequest {

    public static getURL: string = NonAuthRequests.TOPICS;
    public URL: string = TopicsRequest.getURL;

    constructor(public topicVersion: number) {}
}
