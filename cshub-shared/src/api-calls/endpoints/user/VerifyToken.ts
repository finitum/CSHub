import { IApiRequest } from "../../../models";

import { Requests } from "../../Requests";
import { IUser } from "../../../entities/user";

export class VerifyUserTokenCallback {
    constructor(public response: false | IUser) {}
}

export class VerifyToken implements IApiRequest<VerifyUserTokenCallback> {
    public static getURL: string = Requests.VERIFYTOKEN;
    public URL: string = VerifyToken.getURL;
}
