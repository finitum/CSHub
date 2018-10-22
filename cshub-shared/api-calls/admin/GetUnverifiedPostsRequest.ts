import {IApiRequest, IUser} from "../../models";
import {AdminRequests} from "../AdminRequests";

export class GetUnverifiedPostsCallBack {

    constructor(
        public postHashes: number[]
    ) {}
}

export class GetUnverifiedPostsRequest implements IApiRequest {
    public static getURL: string = AdminRequests.GETUNVERIFIEDPOSTS;
    public URL: string = GetUnverifiedPostsRequest.getURL;

    constructor(public startFromResult: number) {}
}
