import { Answer } from "./answer";

export class OpenNumberAnswer extends Answer {
    constructor(public openAnswerNumber: number, public precision: number) {
        super();
    }
}
