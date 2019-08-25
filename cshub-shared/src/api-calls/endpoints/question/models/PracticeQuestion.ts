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
      };

export type PracticeQuestion = {
    id: number;
    question: string;
} & PracticeAnswerType;
