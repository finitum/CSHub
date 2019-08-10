import { IApiRequest } from "../../../models";

import { Requests } from "../../Requests";

export enum ForgotPasswordMailResponseTypes {
    SENT,
    EMAILDOESNTEXIST,
    INVALIDINPUT
}

export class ForgotPasswordMailCallback {
    constructor(public response: ForgotPasswordMailResponseTypes) {}
}

export class ForgotPasswordMail implements IApiRequest {
    public static getURL: string = Requests.FORGOTPASSWORDMAIL;
    public URL: string = ForgotPasswordMail.getURL;

    constructor(public email: string) {}
}
