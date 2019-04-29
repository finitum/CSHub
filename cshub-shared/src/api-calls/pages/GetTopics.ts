import {IApiRequest} from "../../models";
import {ITopic} from "../../models";

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
    public headers: any = {};
    public static readonly topicVersionHeader = "X-Topic-Version";

    constructor(topicVersion: number) {
        this.headers[GetTopics.topicVersionHeader] = topicVersion;
    }
}
