import {IApiRequest} from "../../../models";
import {Requests} from "../../Requests";

export class WIPPostsCallBack {

    constructor(
        public postHashes: number[]
    ) {}
}

export class WIPPosts implements IApiRequest {
    public static getURL: string = Requests.WIPPOSTS;
    public URL: string = WIPPosts.getURL;
}
