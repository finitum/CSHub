import {IApiRequest} from "../../models/IApiRequest";
import {IUser} from "../../models/IUser";

import {NonAuthRequests} from "../NonAuthRequests";

export enum LoginResponses {
    INCORRECTPASS,
    ACCOUNTNOTVERIFIED,
    ACCOUNTBLOCKED,
    SUCCESS,
    NOEXISTINGACCOUNT,
    INVALIDINPUT
}

export class LoginRequestCallBack {

    constructor(
        public response: LoginResponses,
        public userModel?: IUser
    ) {}
}

export class LoginRequest implements IApiRequest {

    public static getURL: string = NonAuthRequests.LOGINREQUEST;
    public URL: string = LoginRequest.getURL;

    constructor(
        public email: string,
        public password: string
    ) {}

}
