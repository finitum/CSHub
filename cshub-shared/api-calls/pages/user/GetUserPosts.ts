import {IApiRequest} from "../../../models/IApiRequest";

import {AuthRequests} from "../../AuthRequests";

export class GetUserPostsCallback {

    constructor(
        public postHashes: number[]
    ) {}
}

export class GetUserPosts implements IApiRequest {

    public static getURL: string = AuthRequests.DASHBOARD;
    public URL: string = GetUserPosts.getURL;

    constructor(public startFromResult: number) {}
}
