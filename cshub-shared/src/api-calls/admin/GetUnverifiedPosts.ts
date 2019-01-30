import {IApiRequest, IUser} from "../../models";
import {Requests} from "../Requests";

export type GetUnverifiedPostsType = {
    hash: number
};

export class GetUnverifiedPostsCallBack {

    constructor(
        public postHashes: GetUnverifiedPostsType[]
    ) {}
}

export class GetUnverifiedPosts implements IApiRequest {
    public static getURL: string = Requests.GETUNVERIFIEDPOSTS;
    public URL: string = GetUnverifiedPosts.getURL;
}
