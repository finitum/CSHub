import { VariableExpression, VariableValue } from "../api-calls/endpoints/question/models/Variable";
import { create, all } from "mathjs";

const math = create(all, {});

export const checkDynamicQuestion = (
    answerExpression: string,
    variables: VariableValue[],
    userAnswer: number | string
): {
    isCorrect: boolean;
    actualAnswer: number | string;
} => {
    const answer = evaluate(answerExpression, variables);

    return {
        isCorrect: answer == userAnswer,
        actualAnswer: answer
    };
};

export const evaluate = (expression: string, variables: VariableValue[]): string | number => {
    const scope: { [name: string]: string | number } = {};
    for (const i of variables) {
        scope[i.name] = i.value;
    }

    if (math.evaluate) {
        return math.evaluate(expression, scope);
    } else {
        throw new Error("Math is not defined!");
    }
};

export const generateVariableValues = (variables: VariableExpression[]): VariableValue[] => {
    const valuedVariables: VariableValue[] = [];

    const dependencyOrder = resolveDependencyTree(variables);

    dependencyOrder.forEach(value =>
        valuedVariables.push({
            name: value.name,
            value: evaluate(value.expression, valuedVariables)
        })
    );

    return valuedVariables;
};

export function getVariableNames(text: string): string[] {
    const regex = /\$([a-zA-Z_$][a-zA-Z_$0-9]*)/g;

    const variableNames: string[] = [];

    let match: RegExpExecArray | null;
    while ((match = regex.exec(text))) {
        variableNames.push(match[1]);
    }

    return variableNames;
}

export const resolveDependencyTree = (variableExpressions: VariableExpression[]): VariableExpression[] => {
    interface VariableType extends VariableExpression {
        dependsOn: string[]; // the names of variables
    }

    const variableDependencyTree: VariableType[] = [];

    variableExpressions.forEach(value => {
        const variableNames = getVariableNames(value.expression);

        if (variableNames.includes(value.name)) {
            throw new Error("Variable depends on itself!");
        }

        variableDependencyTree.push({
            name: value.name,
            expression: value.expression,
            dependsOn: variableNames
        });
    });

    let resolvedDependencies: string[] = [];
    let resolvedDependenciesVariables: VariableExpression[] = [];

    while (variableDependencyTree.length !== 0) {
        let startSize = variableDependencyTree.length;

        for (let i = variableDependencyTree.length - 1; i >= 0; i--) {
            const variable = variableDependencyTree[i];
            const everyVariableResolved = variable.dependsOn.every(name => resolvedDependencies.includes(name));
            if (everyVariableResolved) {
                resolvedDependencies.push(variable.name);
                resolvedDependenciesVariables.push(variable);
                variableDependencyTree.splice(i, 1);
            }
        }

        if (startSize === variableDependencyTree.length) {
            throw new Error("Infinite dependencies between variables!");
        }
    }

    return resolvedDependenciesVariables;
};

export const hasFittingVariables = (
    question: string,
    answer: string,
    explanation: string,
    variableExpressions: VariableExpression[]
): boolean => {
    const variableTexts = question + answer + explanation;
    const variableNames = new Set(getVariableNames(variableTexts));

    if (variableNames.size !== variableExpressions.length) {
        return false;
    }

    resolveDependencyTree(variableExpressions);
    return true;
};
