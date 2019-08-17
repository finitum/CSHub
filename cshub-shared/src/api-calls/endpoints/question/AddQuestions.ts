import { IApiRequest } from "../../../models";
import { Requests } from "../../Requests";
import { QuestionType } from "../../../entities/question";

export type NewAnswerType =
    | {
          type: QuestionType.SINGLECLOSED;
          answerText: string;
      }
    | {
          type: QuestionType.MULTICLOSED;
          answers: {
              answerText: string;
              correct: boolean;
          }[];
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

export type NewQuestion = {
    question: string;
    explanation: string;
    topicHash: number;
} & NewAnswerType;

export class AddQuestions implements IApiRequest<void> {
    public static getURL: string = Requests.ADDQUESTIONS;

    public URL: string = AddQuestions.getURL;

    // topicHash is used here instead of topicHash in question, so we only have to check once :)
    constructor(public questions: NewQuestion[], public topicHash: number) {}
}
