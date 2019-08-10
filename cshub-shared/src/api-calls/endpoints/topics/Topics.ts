import { IApiRequest } from "../../../models";

import { Requests } from "../../Requests";
import { ITopic } from "../../../entities/topic";

export class GetTopicsCallBack {
    constructor(public version: number, public topics?: ITopic[]) {}
}

export class Topics implements IApiRequest {
    public static getURL: string = Requests.TOPICS;

    public static readonly topicVersionHeader = "X-Topic-Version";
    public static readonly studyQueryParam = "studyNr";

    public URL: string = Topics.getURL;

    public headers: { [key: string]: string } = {};
    public params: { [key: string]: string } = {};

    constructor(topicVersion: number, study: number) {
        this.headers[Topics.topicVersionHeader] = topicVersion.toString(10);
        this.params[Topics.studyQueryParam] = study.toString(10);
    }
}
