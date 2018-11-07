import {IApiRequest} from "../../models/IApiRequest";
import {IUser} from "../../models/IUser";

import {NonAuthRequests} from "../NonAuthRequests";

export enum ForgotPasswordMailResponseTypes {
    SENT,
    EMAILDOESNTEXIST,
    INVALIDINPUT
}

export class ForgotPasswordMailCallback {

    constructor(
        public response: ForgotPasswordMailResponseTypes
    ) {}
}

export class ForgotPasswordMail implements IApiRequest {

    public static getURL: string = NonAuthRequests.FORGOTPASSWORD;
    public URL: string = ForgotPasswordMail.getURL;

    constructor(
        public email: string
    ) {}

}
