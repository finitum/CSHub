import {IApiRequest} from "../../models/IApiRequest";
import {IUser} from "../../models/IUser";

import {Requests} from "../Requests";

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

    public static getURL: string = Requests.VERIFYTOKEN;
    public URL: string = VerifyUserToken.getURL;
}
