import {IApiRequest} from "../../models/IApiRequest";

import {NonAuthRequests} from "../NonAuthRequests";

export class IndexCallBack {

    constructor(
        public postIds: number[]
    ) {}
}

export class IndexRequest implements IApiRequest {

    public static getURL: string = NonAuthRequests.INDEXPOSTS;
    public URL: string = IndexRequest.getURL;
}
