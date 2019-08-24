import { IChoice } from "./answer";

// If:
// - multiple choice: has a list of answers (multiple can be correct)
// - open (number): has only a single answer, which will be checked
// - open (string): has only a single answer, which won't be checked
export enum QuestionType {
    SINGLECLOSED = "CLOSED",
    MULTICLOSED = "MULTICLOSED",
    OPENNUMBER = "OPENNUMBER",
    OPENTEXT = "OPENTEXT",
    DYNAMIC = "DYNAMIC"
}

export interface IQuestion {
    id: number;

    question: string;

    type: QuestionType;

    answers: IChoice[];
}
