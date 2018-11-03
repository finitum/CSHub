import {IApiRequest} from "../../models/IApiRequest";
import {IPost} from "../../models/IPost";

import {NonAuthRequests} from "../NonAuthRequests";

export class GetPostCallBack {

    constructor(
        public post: IPost
    ) {}
}

export class GetPost implements IApiRequest {

    public static getURL: string = NonAuthRequests.POSTDATA;
    public URL: string = GetPost.getURL;

    constructor(public postHash: number) {}

}
