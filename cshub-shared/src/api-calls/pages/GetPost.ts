import {IApiRequest} from "../../models";
import {IPost} from "../../models";

import {Requests} from "../Requests";

export class GetPostCallBack {

    constructor(
        public post: IPost
    ) {}
}

export class GetPost implements IApiRequest {

    public static getURL: string = Requests.POSTDATA;
    public URL: string = GetPost.getURL;

    constructor(public postHash: number) {}

}
