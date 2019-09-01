import { QuestionType } from "../../../../entities/question";

export type PracticeAnswerType =
    | {
          type: QuestionType.MULTICLOSED | QuestionType.SINGLECLOSED;
          answers: {
              answer: string;
              id: number;
          }[];
      }
    | {
          type: QuestionType.OPENNUMBER | QuestionType.OPENTEXT;
      }
    | {
          type: QuestionType.DYNAMIC;
          seeds: number[];
      };

export type PracticeQuestion = {
    id: number;
    question: string;
} & PracticeAnswerType;
