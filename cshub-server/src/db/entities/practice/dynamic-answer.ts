import { Answer } from "./answer";
import { Seed } from "./seed";

export class DynamicAnswer extends Answer {
    constructor(public dynamicAnswerExpression: string, public dynamicAnswerSeeds: Seed[]) {
        super();
    }
}
