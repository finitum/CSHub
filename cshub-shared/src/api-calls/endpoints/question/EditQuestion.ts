import { IApiRequest } from "../../../models";
import { Requests } from "../../Requests";
import { NewQuestion } from "./AddQuestions";

export class EditQuestionCallback {
    constructor([]) {}
}

export class EditQuestion implements IApiRequest {
    public static getURL: string = Requests.EDITQUESTION;
    public URL: string = EditQuestion.getURL;

    constructor(public question: NewQuestion, originalId: number) {
        this.URL = this.URL.replace(/:id/, originalId.toString());
    }
}
