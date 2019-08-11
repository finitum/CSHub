import { IQuestion } from "./question";

export interface IAnswer {
    id: number;

    question: IQuestion;

    closedAnswerText?: string;
}
