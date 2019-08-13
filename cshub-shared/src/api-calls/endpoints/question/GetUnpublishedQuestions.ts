import { IApiRequest } from "../../../models";
import { Requests } from "../../Requests";
import { IQuestion } from "../../../entities/question";

export class GetUnpublishedQuestionsCallback {
    constructor(public questions: IQuestion[]) {}
}

export class GetUnpublishedQuestions implements IApiRequest {
    public static getURL: string = Requests.UNPUBLISHEDQUESTIONS;
    public URL: string = GetUnpublishedQuestions.getURL;

    public static readonly studyQueryParam = "study";

    public params: { [key: string]: string } = {};

    constructor(study: number) {
        this.params[GetUnpublishedQuestions.studyQueryParam] = study.toString(10);
    }
}
