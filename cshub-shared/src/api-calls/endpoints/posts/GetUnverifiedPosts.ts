import { IApiRequest } from "../../../models";
import { Requests } from "../../Requests";

export class GetUnverifiedPostsCallBack {
    constructor(public postHashes: number[]) {}
}

export class GetUnverifiedPosts implements IApiRequest<GetUnverifiedPostsCallBack> {
    public static getURL: string = Requests.GETUNVERIFIEDPOSTS;

    public static readonly studyQueryParam = "studyNr";

    public URL: string = GetUnverifiedPosts.getURL;

    public params: { [key: string]: string } = {};

    constructor(study: number) {
        this.params[GetUnverifiedPosts.studyQueryParam] = study.toString(10);
    }
}
