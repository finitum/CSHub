import { IApiRequest } from "../../../models";
import { Requests } from "../../Requests";
import { QuestionType } from "../../../entities/question";

export interface CheckedAnswerType extends ToCheckAnswerType {
    explanation: string;
    correct: boolean | null;
    correctAnswer: CheckAnswerType;
}

export type CheckAnswerType =
    | {
          type: QuestionType.SINGLECLOSED;
          answerId: number;
      }
    | {
          type: QuestionType.MULTICLOSED;
          answerIds: number[];
      }
    | {
          type: QuestionType.OPENNUMBER;
          number: number;
      }
    | {
          type: QuestionType.OPENTEXT;
          text: string;
      };

export class CheckAnswersCallback {
    constructor(public answers: CheckedAnswerType[]) {}
}

interface ToCheckAnswerType {
    questionId: number;
    answer: CheckAnswerType;
}

export class CheckAnswers implements IApiRequest<CheckAnswersCallback> {
    public static getURL: string = Requests.CHECKANSWERS;

    public URL: string = CheckAnswers.getURL;

    constructor(public answers: ToCheckAnswerType[]) {}
}
