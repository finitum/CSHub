import { IApiRequest } from "../../../models";
import { Requests } from "../../Requests";
import { NewQuestion } from "./AddQuestion";

export class EditQuestion implements IApiRequest<void> {
    public static getURL: string = Requests.EDITQUESTION;
    public URL: string = EditQuestion.getURL;

    constructor(public question: NewQuestion, originalId: number) {
        this.URL = this.URL.replace(/:id/, originalId.toString());
    }
}
