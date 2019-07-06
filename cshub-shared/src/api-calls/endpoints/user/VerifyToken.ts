import {IApiRequest} from "../../../models";
import {IUser} from "../../../models";

import {Requests} from "../../Requests";

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

export class VerifyToken implements IApiRequest {

    public static getURL: string = Requests.VERIFYTOKEN;
    public URL: string = VerifyToken.getURL;
}
