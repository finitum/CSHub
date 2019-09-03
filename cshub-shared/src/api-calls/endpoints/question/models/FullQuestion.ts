import { QuestionType } from "../../../../entities/question";
import { VariableExpression } from "./Variable";

export interface FullClosedAnswerType {
    answerText: string;
    correct: boolean;
    answerId: number;
}

export type FullAnswerType =
    | {
          type: QuestionType.MULTICLOSED | QuestionType.SINGLECLOSED;
          answers: FullClosedAnswerType[];
      }
    | {
          type: QuestionType.OPENNUMBER;
          number: number;
          precision: number;
      }
    | {
          type: QuestionType.OPENTEXT;
          answer: string;
      }
    | {
          type: QuestionType.DYNAMIC;
          answerExpression: string;
          variableExpressions: VariableExpression[];
      };

export type FullQuestion = {
    question: string;
    explanation: string;
    replacesQuestion?: number;
} & FullAnswerType;

export type FullQuestionWithId = { id: number } & FullQuestion;
