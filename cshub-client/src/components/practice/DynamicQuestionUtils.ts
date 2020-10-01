import { VariableValue } from "../../../../cshub-shared/src/api-calls/endpoints/question/models/Variable";

export const replaceVariablesByValues = (text: string, variablesAndValues: VariableValue[]) => {
    variablesAndValues.sort((a, b) => b.name.length - a.name.length);

    let newText = text;
    variablesAndValues.forEach((value) => {
        newText = newText.replace(new RegExp(`\\$${value.name}`, "g"), value.value.toString());
    });
    return newText;
};
