import {IApiRequest} from "../../../models";
import {IUser} from "../../../models";

import {Requests} from "../../Requests";

export enum LoginResponseTypes {
    INCORRECTPASS,
    ACCOUNTNOTVERIFIED,
    ACCOUNTBLOCKED,
    SUCCESS,
    NOEXISTINGACCOUNT,
    INVALIDINPUT
}

export class LoginCallBack {

    constructor(
        public response: LoginResponseTypes,
        public userModel?: IUser
    ) {}
}

export class Login implements IApiRequest {

    public static getURL: string = Requests.LOGIN;
    public URL: string = Login.getURL;

    constructor(
        public email: string,
        public password: string
    ) {}

}
