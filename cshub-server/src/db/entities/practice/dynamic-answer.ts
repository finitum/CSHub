import { Answer } from "./answer";
import { Variable } from "./variable";

export class DynamicAnswer extends Answer {
    constructor(public dynamicAnswerExpression: string, public dynamicAnswerVariables: Variable[]) {
        super();
    }
}
