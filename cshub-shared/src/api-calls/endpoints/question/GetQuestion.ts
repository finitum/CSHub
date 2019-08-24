import { IApiRequest } from "../../../models";
import { Requests } from "../../Requests";
import { FullQuestionWithId } from "./models/FullQuestion";
import { PracticeQuestion } from "./models/PracticeQuestion";

export class GetFullQuestionCallback {
    constructor(public question: FullQuestionWithId) {}
}

export class GetFullQuestion implements IApiRequest<GetFullQuestionCallback> {
    public static getURL: string = Requests.FULLQUESTION;

    public URL: string = GetFullQuestion.getURL;

    constructor(questionId: number) {
        this.URL = this.URL.replace(/:id/, questionId.toString());
    }
}

export class GetQuestionCallback {
    constructor(public question: PracticeQuestion) {}
}

export class GetQuestion implements IApiRequest<GetQuestionCallback> {
    public static getURL: string = Requests.FULLQUESTION;

    public URL: string = GetFullQuestion.getURL;

    constructor(questionId: number) {
        this.URL = this.URL.replace(/:id/, questionId.toString());
    }
}
