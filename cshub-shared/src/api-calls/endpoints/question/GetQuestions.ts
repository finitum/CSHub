import { IApiRequest } from "../../../models";
import { Requests } from "../../Requests";

export class GetQuestionsCallback {
    constructor(public questionIds: number[]) {}
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

    /**
     * @see IApiRequest.response
     */
    response?: GetQuestionsCallback;
}

export class GetUnpublishedQuestions implements IApiRequest<GetQuestionsCallback> {
    public static getURL: string = Requests.UNPUBLISHEDQUESTIONS;
    public URL: string = GetUnpublishedQuestions.getURL;

    public static readonly topicQueryParam = "topic";

    public params: { [key: string]: string } = {};

    constructor(study: number) {
        this.params[GetUnpublishedQuestions.topicQueryParam] = study.toString(10);
    }

    /**
     * @see IApiRequest.response
     */
    response?: GetQuestionsCallback;
}
