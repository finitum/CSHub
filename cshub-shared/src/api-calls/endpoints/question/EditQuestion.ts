import { IApiRequest } from "../../../models";
import { Requests } from "../../Requests";
import { FullQuestion } from "./AddQuestion";

export class EditQuestion implements IApiRequest<void> {
    public static getURL: string = Requests.EDITQUESTION;
    public URL: string = EditQuestion.getURL;

    constructor(public question: FullQuestion, originalId: number, public topicHash: number) {
        this.URL = this.URL.replace(/:id/, originalId.toString());
    }
}
