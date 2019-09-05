import { IApiRequest } from "../../../models";
import { Requests } from "../../Requests";

export interface TopicOrNew {
    id: number | null;
    hash: number | null;
    parent: TopicOrNew | null;
    children: TopicOrNew[];
    name: string;
}

export class RestructureTopics implements IApiRequest<void> {
    public static postURL: string = Requests.RESTRUCTURETOPICS;

    public URL: string = RestructureTopics.postURL;

    constructor(studyId: number, public topTopic: TopicOrNew) {
        this.URL = this.URL.replace(/:id/, studyId.toString());
    }
}
