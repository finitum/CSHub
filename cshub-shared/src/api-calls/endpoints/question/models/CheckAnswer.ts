import { QuestionType } from "../../../../entities/question";

export interface ToCheckAnswerType {
    questionId: number;
    answer: CheckAnswerType;
}

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
      }
    | {
          type: QuestionType.DYNAMIC;
          answer: number | string;
          seeds: number[];
      };
