import {IApiRequest} from "../../models/IApiRequest";
import {NonAuthRequests} from "../NonAuthRequests";

export class GetSearchPostsCallback {

    constructor(public hashes: number[]) {}
}

export class GetSearchPosts implements IApiRequest {

    public static getURL: string = NonAuthRequests.SEARCH;
    public URL: string = GetSearchPosts.getURL;

    constructor(
        public query: string
    ) {}
}
