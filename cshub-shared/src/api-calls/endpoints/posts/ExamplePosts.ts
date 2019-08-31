import { IApiRequest } from "../../../models";
import { Requests } from "../../Requests";
import { PostHashes } from "./TopicPosts";

export class ExamplePosts implements IApiRequest<PostHashes> {
    public static getURL: string = Requests.GETEXAMPLES;
    public URL: string = ExamplePosts.getURL;

    constructor(topicHash: number) {
        this.URL = this.URL.replace(/:topichash/, topicHash.toString());
    }

    /**
     * @see IApiRequest.response
     */
    response?: PostHashes;
}
