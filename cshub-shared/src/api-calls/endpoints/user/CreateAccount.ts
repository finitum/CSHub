import { IApiRequest } from "../../../models";

import { Requests } from "../../Requests";

export enum CreateAccountResponseTypes {
    INVALIDINPUT,
    SUCCESS,
    ALREADYEXISTS
}

export class CreateAccountCallBack {
    constructor(public response: CreateAccountResponseTypes) {}
}

export class CreateAccount implements IApiRequest {
    public static getURL: string = Requests.CREATEACCOUNT;
    public URL: string = CreateAccount.getURL;

    constructor(public email: string, public password: string, public firstname: string, public lastname: string) {}
}
