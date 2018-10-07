import {IApiRequest} from "../../models/IApiRequest";
import {IPost} from "../../models/IPost";

import {NonAuthRequests} from "../NonAuthRequests";

export class GetIndexCallBack {

    constructor(
        public posts: IPost[]
    ) {}
}

export class GetIndexRequest implements IApiRequest {

    public static getURL: string = NonAuthRequests.GETINDEXTOPICS;
    public URL: string = GetIndexRequest.getURL;
}
