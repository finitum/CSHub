import { IApiRequest } from "../../../models";

import { Requests } from "../../Requests";

export class SubmitTopic implements IApiRequest {
    public static getURL: string = Requests.SUBMITTOPIC;
    public URL: string = SubmitTopic.getURL;

    constructor(public topicTitle: string, public topicParentHash: number) {}
}
