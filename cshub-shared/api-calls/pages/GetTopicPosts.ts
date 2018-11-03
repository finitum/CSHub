import {IApiRequest} from "../../models/IApiRequest";

import {NonAuthRequests} from "../NonAuthRequests";

export class GetTopicPostsCallBack {

    constructor(
        public postHashes: number[]
    ) {}
}

export class GetTopicPosts implements IApiRequest {

    public static getURL: string = NonAuthRequests.TOPICPOSTS;
    public URL: string = GetTopicPosts.getURL;

    constructor(
        public topicHash: number,
        public startFromResult: number
    ) {}
}
