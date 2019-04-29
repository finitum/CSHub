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

    constructor(getFavorites = false) {
        const type = getFavorites ? "favorites" : "myposts";
        this.URL = this.URL.replace(/:type/, type);
    }
}
