import {IApiRequest} from "../../models/IApiRequest";

import {NonAuthRequests} from "../NonAuthRequests";
// @ts-ignore
import Delta from "quill-delta/dist/Delta";

export class PostContentCallBack {

    constructor(
        public content: Delta
    ) {}
}

export class PostContentRequest implements IApiRequest {

    public static getURL: string = NonAuthRequests.POSTCONTENT;
    public URL: string = PostContentRequest.getURL;
    public isReduced: boolean = false;

    constructor(public postHash: number) {}

}
