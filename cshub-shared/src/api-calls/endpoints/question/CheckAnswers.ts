import { IApiRequest } from "../../../models";
import { Requests } from "../../Requests";
import { QuestionType } from "../../../../../cshub-server/src/db/entities/question";

export interface CheckedAnswerType extends ToCheckAnswerType {
    explanation: string;
    correct: boolean | null;
    correctAnswer: AnswerType;
}

export class CheckAnswersCallback {
    constructor(public answers: CheckedAnswerType[]) {}
}

export type AnswerType =
    | {
          type: QuestionType.CLOSED;
          onlyOneAnswer: true;
          answerId: number;
      }
    | {
          type: QuestionType.CLOSED;
          onlyOneAnswer: false;
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

interface ToCheckAnswerType {
    questionId: number;
    answer: AnswerType;
}

export class CheckAnswers implements IApiRequest {
    public static getURL: string = Requests.CHECKANSWERS;

    public URL: string = CheckAnswers.getURL;

    constructor(public answers: ToCheckAnswerType[]) {}
}
