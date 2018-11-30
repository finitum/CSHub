import {IApiRequest} from "../../models/IApiRequest";
import {IPost} from "../../models/IPost";
import {ITopic} from "../../models/ITopic";

import {Requests} from "../Requests";

export class GetTopicsCallBack {

    constructor(
        public topics?: ITopic[],
        public version?: number
    ) {}
}

export class GetTopics implements IApiRequest {

    public static getURL: string = Requests.TOPICS;
    public URL: string = GetTopics.getURL;

    constructor(public topicVersion: number) {}
}
