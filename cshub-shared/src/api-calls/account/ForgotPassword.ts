import {IApiRequest} from "../../models/IApiRequest";
import {IUser} from "../../models/IUser";

import {NonAuthRequests} from "../NonAuthRequests";

export enum ForgotPasswordResponseTypes {
    CHANGED,
    INVALIDINPUT
}

export class ForgotPasswordCallback {

    constructor(
        public response: ForgotPasswordResponseTypes
    ) {}
}

export class ForgotPassword implements IApiRequest {

    public static getURL: string = NonAuthRequests.FORGOTPASSWORD;
    public URL: string = ForgotPassword.getURL;

    constructor(
        public password: string,
        public hash: number,
        public accId: number
    ) {}

}