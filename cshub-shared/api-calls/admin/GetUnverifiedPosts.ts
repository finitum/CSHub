import {IApiRequest, IUser} from "../../models";
import {AdminRequests} from "../AdminRequests";

export class GetUnverifiedPostsCallBack {

    constructor(
        public postHashes: number[]
    ) {}
}

export class GetUnverifiedPosts implements IApiRequest {
    public static getURL: string = AdminRequests.GETUNVERIFIEDPOSTS;
    public URL: string = GetUnverifiedPosts.getURL;
}
