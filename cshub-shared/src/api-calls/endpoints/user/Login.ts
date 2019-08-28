import { IApiRequest } from "../../../models";

import { Requests } from "../../Requests";
import { IUser } from "../../../entities/user";

export enum LoginResponseTypes {
    INCORRECTPASS,
    ACCOUNTNOTVERIFIED,
    ACCOUNTBLOCKED,
    SUCCESS,
    NOEXISTINGACCOUNT,
    INVALIDINPUT
}

export class LoginCallBack {
    constructor(public response: LoginResponseTypes, public userModel?: IUser) {}
}

export class Login implements IApiRequest<LoginCallBack> {
    public static getURL: string = Requests.LOGIN;
    public URL: string = Login.getURL;

    constructor(public email: string, public password: string) {}
}

export class Logout implements IApiRequest<void> {
    public static getURL: string = Requests.LOGOUT;
    public URL: string = Logout.getURL;

    constructor() {}
}
