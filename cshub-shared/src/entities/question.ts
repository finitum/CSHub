import { QuestionType } from "../../../cshub-server/src/db/entities/question";
import { Answer } from "../../../cshub-server/src/db/entities/answer";

export interface IQuestion {
    id: number;

    question: string;

    questionType: QuestionType;

    onlyOneAnswer: boolean;

    answers: Answer[];
}
