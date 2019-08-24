import { IApiRequest } from "../../../models";
import { Requests } from "../../Requests";
import { FullQuestion } from "./models/FullQuestion";

export class AddQuestion implements IApiRequest<void> {
    public static getURL: string = Requests.ADDQUESTIONS;

    public URL: string = AddQuestion.getURL;

    // topicHash is used here instead of topicHash in question, so we only have to check once :)
    constructor(public question: FullQuestion, public topicHash: number) {}
}

export class EditQuestion implements IApiRequest<void> {
    public static getURL: string = Requests.EDITQUESTION;
    public URL: string = EditQuestion.getURL;

    constructor(public question: FullQuestion, originalId: number, public topicHash: number) {
        this.URL = this.URL.replace(/:id/, originalId.toString());
    }
}
