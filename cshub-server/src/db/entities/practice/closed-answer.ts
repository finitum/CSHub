import { Answer } from "./answer";

export class ClosedAnswer extends Answer {
    closedAnswerText!: string;
    correct!: boolean;

    constructor(closedAnswerText: string, correct: boolean) {
        super();
        this.closedAnswerText = closedAnswerText;
        this.correct = correct;
    }
}
