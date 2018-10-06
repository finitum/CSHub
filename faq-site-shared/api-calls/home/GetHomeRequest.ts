import {IApiRequest} from "../../models/IApiRequest";
import {IPost} from "../../models/IPost";
import {ITopic} from "../../models/ITopic";

import {NonAuthRequests} from "../NonAuthRequests";

export class GetHomeCallBack {

    constructor(
        public posts: IPost[],
        public topics: ITopic[]
    ) {}
}

export class GetHomeRequest implements IApiRequest {

    public static getURL: string = NonAuthRequests.GETHOMEDATA;
    public URL: string = GetHomeRequest.getURL;
}
