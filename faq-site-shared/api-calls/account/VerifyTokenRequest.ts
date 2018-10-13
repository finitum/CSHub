import {IApiRequest} from "../../models/IApiRequest";
import {IUser} from "../../models/IUser";

import {NonAuthRequests} from "../NonAuthRequests";

export enum VerifyTokenResponses {
    VALID,
    INVALID
}

export class VerifyTokenRequestCallBack {

    constructor(
        public response: VerifyTokenResponses,
        public userModel?: IUser
    ) {}
}

export class VerifyTokenRequest implements IApiRequest {

    public static getURL: string = NonAuthRequests.VERIFYTOKEN;
    public URL: string = VerifyTokenRequest.getURL;
}
