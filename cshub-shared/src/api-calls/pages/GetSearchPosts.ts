import {IApiRequest} from "../../models/IApiRequest";
import {Requests} from "../Requests";

export class GetSearchPostsCallback {

    constructor(public hashes: number[]) {}
}

export class GetSearchPosts implements IApiRequest {

    public static getURL: string = Requests.SEARCH;
    public URL: string = GetSearchPosts.getURL;

    constructor(query: string) {
        this.URL += "?query=" + query;
    }
}
