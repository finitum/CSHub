import {IApiRequest} from "../../models";

import {Requests} from "../Requests";

export class GetTopicPostsCallBack {

    constructor(
        public postHashes: number[]
    ) {}
}

export class GetTopicPosts implements IApiRequest {

    public static getURL: string = Requests.TOPICPOSTS;
    public URL: string = GetTopicPosts.getURL;

    constructor(topicHash: number) {
        this.URL = this.URL.replace(/:topichash/, topicHash.toString());
    }
}
