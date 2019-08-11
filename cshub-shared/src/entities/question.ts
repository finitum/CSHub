import { QuestionType } from "../../../cshub-server/src/db/entities/question";
import { ITopic } from "./topic";
import { Answer } from "../../../cshub-server/src/db/entities/answer";

export interface IQuestion {
    id: number;

    topic: ITopic;

    question: string;

    questionType: QuestionType;

    active: boolean;

    answers: Answer[];
}
