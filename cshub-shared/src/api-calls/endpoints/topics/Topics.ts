import {IApiRequest} from "../../../models";
import {ITopic} from "../../../models";

import {Requests} from "../../Requests";

export class GetTopicsCallBack {

    constructor(
        public topics?: ITopic[],
        public version?: number
    ) {}
}

export class Topics implements IApiRequest {

    public static getURL: string = Requests.TOPICS;
    public URL: string = Topics.getURL;
    public headers: any = {};
    public static readonly topicVersionHeader = "X-Topic-Version";

    constructor(topicVersion: number) {
        this.headers[Topics.topicVersionHeader] = topicVersion;
    }
}
