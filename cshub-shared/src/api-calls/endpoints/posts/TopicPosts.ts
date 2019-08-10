import { IApiRequest } from "../../../models";

import { Requests } from "../../Requests";

export class GetTopicPostsCallBack {
    constructor(public postHashes: number[]) {}
}

export class TopicPosts implements IApiRequest {
    public static getURL: string = Requests.TOPICPOSTS;
    public URL: string = TopicPosts.getURL;

    constructor(topicHash: number) {
        this.URL = this.URL.replace(/:topichash/, topicHash.toString());
    }
}
