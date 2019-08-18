import { IApiRequest } from "../../../models";
import { Requests } from "../../Requests";

export class RenameTopic implements IApiRequest<void> {
    public static postURL: string = Requests.RENAMETOPIC;

    public URL: string = RenameTopic.postURL;

    constructor(topicId: number, public newName: string) {
        this.URL = this.URL.replace(/:id/, topicId.toString());
    }
}
