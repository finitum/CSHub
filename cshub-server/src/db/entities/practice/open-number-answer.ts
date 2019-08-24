import { Answer } from "./answer";

export class OpenNumberAnswer extends Answer {
    openAnswerNumber!: number;
    precision!: number;

    constructor(openAnswerNumber: number, precision: number) {
        super();
        this.openAnswerNumber = openAnswerNumber;
        this.precision = precision;
    }
}
