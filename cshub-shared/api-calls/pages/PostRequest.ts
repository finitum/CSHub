import {IApiRequest} from "../../models/IApiRequest";
import {IPost} from "../../models/IPost";

import {NonAuthRequests} from "../NonAuthRequests";
// @ts-ignore
import Delta from "quill-delta/dist/Delta";

export class PostCallBack {

    constructor(
        public post: IPost,
        public content?: Delta
    ) {}
}

export class PostRequest implements IApiRequest {

    public static getURL: string = NonAuthRequests.POSTDATA;
    public URL: string = PostRequest.getURL;

    constructor(public postHash: number, public giveContent: boolean) {}

}
