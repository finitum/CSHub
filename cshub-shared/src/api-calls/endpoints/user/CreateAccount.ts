import { IApiRequest } from "../../../models";

import { Requests } from "../../Requests";
import { IEmailDomain } from "../../../entities/emaildomains";

export enum CreateAccountResponseTypes {
    INVALIDINPUT,
    SUCCESS,
    ALREADYEXISTS,
}

export class CreateAccountCallBack {
    constructor(public response: CreateAccountResponseTypes) {}
}

export class CreateAccount implements IApiRequest<CreateAccountCallBack> {
    public static getURL: string = Requests.CREATEACCOUNT;
    public URL: string = CreateAccount.getURL;

    constructor(
        public email: string,
        public password: string,
        public firstname: string,
        public lastname: string,
        public domain: IEmailDomain,
    ) {}
}
