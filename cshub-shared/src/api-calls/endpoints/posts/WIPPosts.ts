import { IApiRequest } from "../../../models";
import { Requests } from "../../Requests";

export class WIPPostsCallBack {
    constructor(public postHashes: number[]) {}
}

export class WIPPosts implements IApiRequest {
    public static getURL: string = Requests.WIPPOSTS;

    public static readonly studyQueryParam = "studyNr";

    public URL: string = WIPPosts.getURL;

    public params: { [key: string]: string } = {};

    constructor(study: number) {
        this.params[WIPPosts.studyQueryParam] = study.toString(10);
    }
}
