import { VariableValue } from "../../../../cshub-shared/src/api-calls/endpoints/question/models/Variable";

export const replaceVariablesByValues = (text: string, variablesAndValues: VariableValue[]) => {
    variablesAndValues.sort((a, b) => b.name.length - a.name.length);

    let newText = text;
    variablesAndValues.forEach(value => {
        const computedValue = value.value === null? "" : value.value.toString();
        newText = newText.replace(new RegExp(`\\$${value.name}`, "g"), computedValue);

    });
    return newText;
};
