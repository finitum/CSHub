import { Answer } from "./answer";

export class OpenTextAnswer extends Answer {
    constructor(public openAnswerText: string) {
        super();
    }
}
