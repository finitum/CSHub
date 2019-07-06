import {IApiRequest} from "../../../models";
import {Requests} from "../../Requests";

export class GetUnverifiedPostsCallBack {

    constructor(
        public postHashes: number[]
    ) {}
}

export class GetUnverifiedPosts implements IApiRequest {
    public static getURL: string = Requests.GETUNVERIFIEDPOSTS;
    public URL: string = GetUnverifiedPosts.getURL;
}
