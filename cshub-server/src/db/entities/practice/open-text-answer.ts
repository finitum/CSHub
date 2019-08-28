import { Answer } from "./answer";

export class OpenTextAnswer extends Answer {
    openAnswerText!: string;

    constructor(openAnswerText: string) {
        super();
        this.openAnswerText = openAnswerText;
    }
}
