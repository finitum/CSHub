import { IApiRequest } from "../../../models";
import { Requests } from "../../Requests";
import { CheckedAnswerType, ToCheckAnswerType } from "./models/CheckAnswer";

export class CheckAnswersCallback {
    constructor(public answers: CheckedAnswerType[]) {}
}

export class CheckAnswers implements IApiRequest<CheckAnswersCallback> {
    public static getURL: string = Requests.CHECKANSWERS;

    public URL: string = CheckAnswers.getURL;

    constructor(public answers: ToCheckAnswerType[]) {}

    /**
     * @see IApiRequest.response
     */
    response?: CheckAnswersCallback;
}
