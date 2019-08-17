import { IApiRequest } from "../../../models";
import { Requests } from "../../Requests";
import { IQuestion } from "../../../entities/question";

export class GetQuestionsCallback {
    constructor(public questions: IQuestion[]) {}
}

export class GetQuestions implements IApiRequest<GetQuestionsCallback> {
    public static getURL: string = Requests.QUESTIONS;

    public static readonly topicQueryParam = "topic";
    public static readonly questionAmountQueryParam = "amount";

    public URL: string = GetQuestions.getURL;

    public params: { [key: string]: string } = {};

    constructor(topic: number, amount?: number) {
        this.params[GetQuestions.topicQueryParam] = topic.toString(10);

        if (amount) {
            this.params[GetQuestions.questionAmountQueryParam] = amount.toString(10);
        }
    }
}
