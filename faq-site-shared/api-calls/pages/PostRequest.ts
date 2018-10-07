import {IApiRequest} from "../../models/IApiRequest";
import {IPost, IPostReduced} from "../../models/IPost";

import {NonAuthRequests} from "../NonAuthRequests";

export interface IPostRequest {

    isReduced: boolean;
    postId: number;
}

export class PostCallBack {

    constructor(
        public post: IPost
    ) {}
}

export class PostRequest implements IApiRequest, IPostRequest {

    public static getURL: string = NonAuthRequests.POSTDATA;
    public URL: string = PostRequest.getURL;
    public isReduced: boolean = false;

    constructor(public postId: number) {}

}

export class PostPreviewCallBack {

    constructor(
        public post: IPostReduced
    ) {}
}

export class PostPreviewRequest implements IApiRequest, IPostRequest {

    public static getURL: string = NonAuthRequests.POSTDATA;
    public URL: string = PostRequest.getURL;
    public isReduced: boolean = true;

    constructor(public postId: number) {}
}


