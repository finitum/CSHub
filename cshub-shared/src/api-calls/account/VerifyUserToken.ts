import {IApiRequest} from "../../models/IApiRequest";
import {IUser} from "../../models/IUser";

import {NonAuthRequests} from "../NonAuthRequests";

export enum VerifyUserTokenResponseTypes {
    VALID,
    INVALID
}

export class VerifyUserTokenCallback {

    constructor(
        public response: VerifyUserTokenResponseTypes,
        public userModel?: IUser
    ) {}
}

export class VerifyUserToken implements IApiRequest {

    public static getURL: string = NonAuthRequests.VERIFYTOKEN;
    public URL: string = VerifyUserToken.getURL;
}
