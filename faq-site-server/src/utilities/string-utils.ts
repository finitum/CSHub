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

export const validateMultipleInputs = (...inputs: ICustomValidatorInput[]): ICustomValidatorResponse => {
    for (const input of inputs) {
        const validationResult = customValidator(input);
        if (!validationResult.valid) {
            return {valid: false, error: validationResult.error, value: validationResult.value};
        }
    }

    return {valid: true};
};
