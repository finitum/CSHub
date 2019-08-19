import { IApiRequest } from "../../../models";
import { Requests } from "../../Requests";
import { ITopic } from "../../../entities/topic";

export class RenameTopic implements IApiRequest<void> {
    public static postURL: string = Requests.RENAMETOPIC;

    public URL: string = RenameTopic.postURL;

    constructor(topicId: number, public newName: string) {
        this.URL = this.URL.replace(/:id/, topicId.toString());
    }
}

export class RestructureTopics implements IApiRequest<void> {
    public static postURL: string = Requests.RESTRUCTURETOPICS;

    public URL: string = RestructureTopics.postURL;

    constructor(studyId: number, public topics: ITopic[]) {
        this.URL = this.URL.replace(/:id/, studyId.toString());
    }
}
