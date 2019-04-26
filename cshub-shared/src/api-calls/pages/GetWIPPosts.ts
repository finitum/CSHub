import {IApiRequest} from "../../models";
import {Requests} from "../Requests";

export class GetWIPPostsCallBack {

    constructor(
        public postHashes: number[]
    ) {}
}

export class GetWIPPosts implements IApiRequest {
    public static getURL: string = Requests.WIPPOSTS;
    public URL: string = GetWIPPosts.getURL;
}
