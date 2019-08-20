import { IApiRequest } from "../../../models";
import { Requests } from "../../Requests";
import { ITopic } from "../../../entities/topic";

export class RestructureTopics implements IApiRequest<void> {
    public static postURL: string = Requests.RESTRUCTURETOPICS;

    public URL: string = RestructureTopics.postURL;

    constructor(studyId: number, public topTopic: ITopic, public newTopics: { name: string; parentHash: number }[]) {
        this.URL = this.URL.replace(/:id/, studyId.toString());
    }
}
