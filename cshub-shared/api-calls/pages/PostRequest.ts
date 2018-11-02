import {IApiRequest} from "../../models/IApiRequest";
import {IPost} from "../../models/IPost";

import {NonAuthRequests} from "../NonAuthRequests";

export class PostCallBack {

    constructor(
        public post: IPost
    ) {}
}

export class PostRequest implements IApiRequest {

    public static getURL: string = NonAuthRequests.POSTDATA;
    public URL: string = PostRequest.getURL;

    constructor(public postHash: number) {}

}
