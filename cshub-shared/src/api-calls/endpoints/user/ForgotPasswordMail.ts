import { IApiRequest } from "../../../models";

import { Requests } from "../../Requests";
import { IEmailDomain } from "../../../entities/emaildomains";

export enum ForgotPasswordMailResponseTypes {
    SENT,
    EMAILDOESNTEXIST,
    INVALIDINPUT
}

export class ForgotPasswordMailCallback {
    constructor(public response: ForgotPasswordMailResponseTypes) {}
}

export class ForgotPasswordMail implements IApiRequest<ForgotPasswordMailCallback> {
    public static getURL: string = Requests.FORGOTPASSWORDMAIL;
    public URL: string = ForgotPasswordMail.getURL;

    constructor(public email: string, public domain: IEmailDomain) {}
}
