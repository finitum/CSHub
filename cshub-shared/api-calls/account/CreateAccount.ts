import {IApiRequest} from "../../models/IApiRequest";

import {NonAuthRequests} from "../NonAuthRequests";

export enum CreateAccountResponseTypes {
    INVALIDINPUT,
    SUCCESS,
    ALREADYEXISTS
}

export class CreateAccountCallBack {

    constructor(
        public response: CreateAccountResponseTypes
    ) {}
}

export class CreateAccount implements IApiRequest {

    public static getURL: string = NonAuthRequests.CREATEACCOUNTREQUEST;
    public URL: string = CreateAccount.getURL;

    constructor(
        public email: string,
        public password: string,
        public firstname: string,
        public lastname: string
    ) {}

}
