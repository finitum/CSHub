import {IApiRequest} from "../../models/IApiRequest";
import {IPost} from "../../models/IPost";
import {ITopic} from "../../models/ITopic";

import {NonAuthRequests} from "../NonAuthRequests";

export class GetTopicsCallBack {

    constructor(
        public topics: ITopic[]
    ) {}
}

export class GetTopicsRequest implements IApiRequest {

    public static getURL: string = NonAuthRequests.GETTOPICS;
    public URL: string = GetTopicsRequest.getURL;
}
