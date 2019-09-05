import { QuestionType } from "../../../../entities/question";
import { VariableValue } from "./Variable";

export type PracticeAnswerType =
    | {
          type: QuestionType.MULTICLOSED | QuestionType.SINGLECLOSED;
          answers: {
              answer: string;
              id: number;
          }[];
      }
    | {
          type: QuestionType.OPENNUMBER;
          precision: number;
      }
    | {
          type: QuestionType.OPENTEXT;
      }
    | {
          type: QuestionType.DYNAMIC;
          variables: VariableValue[];
      };

export type PracticeQuestion = {
    id: number;
    question: string;
} & PracticeAnswerType;
