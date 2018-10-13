import {IApiRequest} from "../../models/IApiRequest";

import {NonAuthRequests} from "../NonAuthRequests";

export enum CreateAccountResponses {
    INVALIDINPUT,
    SUCCESS,
    ALREADYEXISTS
}

export class CreateAccountRequestCallBack {

    constructor(
        public response: CreateAccountResponses
    ) {}
}

export class CreateAccountRequest implements IApiRequest {

    public static getURL: string = NonAuthRequests.CREATEACCOUNTREQUEST;
    public URL: string = CreateAccountRequest.getURL;

    constructor(
        public email: string,
        public password: string,
        public firstname: string,
        public lastname: string
    ) {}

}
