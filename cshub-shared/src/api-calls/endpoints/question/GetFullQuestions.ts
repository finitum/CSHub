import { IApiRequest } from "../../../models";
import { Requests } from "../../Requests";
import { FullQuestion } from "./AddQuestion";

export type FullQuestionWithId = { id: number } & FullQuestion;

export class GetFullQuestionsCallback {
    constructor(public questions: FullQuestionWithId[]) {}
}

export class GetFullQuestions implements IApiRequest<GetFullQuestionsCallback> {
    public static getURL: string = Requests.FULLQUESTIONS;

    public static readonly topicQueryParam = "topic";

    public URL: string = GetFullQuestions.getURL;

    public params: { [key: string]: string } = {};

    constructor(topic: number) {
        this.params[GetFullQuestions.topicQueryParam] = topic.toString(10);
    }
}
