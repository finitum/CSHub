import {IApiRequest} from "../../models/IApiRequest";

import {Requests} from "../Requests";

export class GetTopicPostsCallBack {

    constructor(
        public postHashes: number[]
    ) {}
}

export class GetTopicPosts implements IApiRequest {

    public static getURL: string = Requests.TOPICPOSTS;
    public URL: string = GetTopicPosts.getURL;

    constructor(
        public topicHash: number
    ) {}
}
