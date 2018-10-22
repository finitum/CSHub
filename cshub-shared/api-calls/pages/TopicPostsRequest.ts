import {IApiRequest} from "../../models/IApiRequest";

import {NonAuthRequests} from "../NonAuthRequests";

export class TopicPostsCallBack {

    constructor(
        public postHashes: number[]
    ) {}
}

export class TopicPostsRequest implements IApiRequest {

    public static getURL: string = NonAuthRequests.TOPICPOSTS;
    public URL: string = TopicPostsRequest.getURL;

    constructor(
        public topicHash: number,
        public startFromResult: number
    ) {}
}
