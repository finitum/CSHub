import { IApiRequest } from "../../../models";
import { Requests } from "../../Requests";
import { QuestionType } from "../../../entities/question";

export interface ClosedAnswerType {
    answerText: string;
    correct: boolean;
}

export type FullAnswerType =
    | {
          type: QuestionType.MULTICLOSED | QuestionType.SINGLECLOSED;
          answers: ClosedAnswerType[];
      }
    | {
          type: QuestionType.OPENNUMBER;
          number: number;
          precision: number;
      }
    | {
          type: QuestionType.OPENTEXT;
          answer: string;
      };

export type FullQuestion = {
    question: string;
    explanation: string;
} & FullAnswerType;

export class AddQuestion implements IApiRequest<void> {
    public static getURL: string = Requests.ADDQUESTIONS;

    public URL: string = AddQuestion.getURL;

    // topicHash is used here instead of topicHash in question, so we only have to check once :)
    constructor(public question: FullQuestion, public topicHash: number) {}
}
