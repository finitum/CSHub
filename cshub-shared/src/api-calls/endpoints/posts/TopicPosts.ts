import { IApiRequest } from "../../../models";

import { Requests } from "../../Requests";

export class PostHashes {
    constructor(public postHashes: number[]) {}
}

export class TopicPosts implements IApiRequest<PostHashes> {
    public static getURL: string = Requests.TOPICPOSTS;
    public URL: string = TopicPosts.getURL;

    constructor(topicHash: number) {
        this.URL = this.URL.replace(/:topichash/, topicHash.toString());
    }

    /**
     * @see IApiRequest.response
     */
    response?: PostHashes;
}
