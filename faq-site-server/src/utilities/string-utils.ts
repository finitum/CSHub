export interface ICustomValidatorResponse {
    valid: boolean;
    value?: string;
    error?: CustomValidatorReponseTypes;
}

export interface ICustomValidatorInput {
    input: string;
    validationObject?: ICustomValidatorInputObject;
}

export interface ICustomValidatorInputObject {
    nullemptyundefined?: boolean;
    null?: boolean;
    undefined?: boolean;
    empty?: boolean;
    length?: number;
    tuemail?: boolean;
}

export enum CustomValidatorReponseTypes {
    NULLEMPTYUNDEFINED,
    NULL,
    UNDEFINED,
    EMPTY,
    LENGTH,
    TUEMAIL
}

// This validates the input string based on a few types which can be added to. By default, nullemptyundefined is always on
// It will return a response which tells it if it's valid, gives the enum of the error and the value of the string is something is wrong
export const customValidator = (input: ICustomValidatorInput): ICustomValidatorResponse => {

    if (input.validationObject === undefined) {
        input.validationObject = {nullemptyundefined: true};
    }
    if (input.validationObject.nullemptyundefined === undefined) {
        input.validationObject.nullemptyundefined = true;
    }

    if (input.validationObject.nullemptyundefined && (input === null || input === undefined || input.input === "")) {
        return {valid: false, error: CustomValidatorReponseTypes.NULLEMPTYUNDEFINED, value: input.input};
    } else if (input.validationObject.null && input === null) {
        return {valid: false, error: CustomValidatorReponseTypes.NULL, value: input.input};
    } else if (input.validationObject.undefined && input === undefined) {
        return {valid: false, error: CustomValidatorReponseTypes.UNDEFINED, value: input.input};
    } else if (input.validationObject.empty && input.input === "") {
        return {valid: false, error: CustomValidatorReponseTypes.EMPTY, value: input.input};
    } else if (input.validationObject.length && input.validationObject.length > 0 && input.input.length < input.validationObject.length) {
        return {valid: false, error: CustomValidatorReponseTypes.LENGTH, value: input.input};
    } else if (input.validationObject.tuemail) {
        const regex = new RegExp("^[a-zA-Z.]*$");
        if (!regex.test(input.input)) { return {valid: false, error: CustomValidatorReponseTypes.TUEMAIL, value: input.input}; }
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
