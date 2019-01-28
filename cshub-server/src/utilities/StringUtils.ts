import {isValidEmail} from "../../../cshub-shared/src/utilities/TUEmail";

export interface ICustomValidatorResponse {
    valid: boolean;
    value?: string | number | object;
    error?: CustomValidatorReponseTypes;
}

export interface ICustomValidatorInput {
    input: string | number | object;
    validationObject?: ICustomValidatorInputObject;
}

export interface ICustomValidatorInputObject {
    nullemptyundefined?: boolean;
    null?: boolean;
    undefined?: boolean;
    empty?: boolean;
    minlength?: number;
    maxlength?: number;
    tuemail?: boolean;
}

export enum CustomValidatorReponseTypes {
    NULLEMPTYUNDEFINED,
    NULL,
    UNDEFINED,
    EMPTY,
    MINLENGTH,
    MAXLENGTH,
    TUEMAIL
}

// This validates the input string based on a few types which can be added to. By default, nullemptyundefined is always on
// It will return a response which tells it if it's valid, gives the enum of the error and the value of the string is something is wrong
export const customValidator = (input: ICustomValidatorInput): ICustomValidatorResponse => {

    const inputString = input.input.toString();

    if (input.validationObject === undefined) {
        input.validationObject = {nullemptyundefined: true};
    }
    if (input.validationObject.nullemptyundefined === undefined) {
        input.validationObject.nullemptyundefined = true;
    }

    if (input.validationObject.nullemptyundefined && (input.input === null || input.input === undefined || input.input === "")) {
        return {valid: false, error: CustomValidatorReponseTypes.NULLEMPTYUNDEFINED, value: input.input};
    } else if (input.validationObject.null && input.input === null) {
        return {valid: false, error: CustomValidatorReponseTypes.NULL, value: input.input};
    } else if (input.validationObject.undefined && input.input === undefined) {
        return {valid: false, error: CustomValidatorReponseTypes.UNDEFINED, value: input.input};
    } else if (input.validationObject.empty && input.input === "") {
        return {valid: false, error: CustomValidatorReponseTypes.EMPTY, value: input.input};
    } else if (input.validationObject.minlength && input.validationObject.minlength > 0 && inputString.length < input.validationObject.minlength) {
        return {valid: false, error: CustomValidatorReponseTypes.MINLENGTH, value: input.input};
    } else if (input.validationObject.maxlength && input.validationObject.maxlength > 0 && inputString.length > input.validationObject.maxlength) {
        return {valid: false, error: CustomValidatorReponseTypes.MAXLENGTH, value: input.input};
    } else if (input.validationObject.tuemail) {
        if (!isValidEmail(input.input.toString())) {
            return {valid: false, error: CustomValidatorReponseTypes.TUEMAIL, value: input.input};
        } else {
            return {valid: true};
        }
    } else {
        return {valid: true};
    }

};

// It will validate multiple inputs, and when the first one gives an error, that will be the one that is returned in the response object
export const validateMultipleInputs = (...inputs: ICustomValidatorInput[]): ICustomValidatorResponse => {
    for (const input of inputs) {
        const validationResult = customValidator(input);
        if (!validationResult.valid) {
            return {valid: false, error: validationResult.error, value: validationResult.value};
        }
    }

    return {valid: true};
};
