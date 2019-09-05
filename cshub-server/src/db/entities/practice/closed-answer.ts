import { Answer } from "./answer";

export class ClosedAnswer extends Answer {
    constructor(public closedAnswerText: string, public correct: boolean) {
        super();
    }
}
