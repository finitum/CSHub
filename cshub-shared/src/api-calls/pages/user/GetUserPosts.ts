import {IApiRequest} from "../../../models/IApiRequest";

import {Requests} from "../../Requests";

export class GetUserPostsCallback {

    constructor(
        public postHashes: number[]
    ) {}
}

export class GetUserPosts implements IApiRequest {

    public static getURL: string = Requests.DASHBOARD;
    public URL: string = GetUserPosts.getURL;
}
