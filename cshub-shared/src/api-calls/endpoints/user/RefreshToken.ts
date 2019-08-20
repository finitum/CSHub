import { IApiRequest } from "../../../models";

import { Requests } from "../../Requests";

export enum RefreshResponseType {
    SUCCESS,
    INVALIDTOKEN
}

export class RefreshTokenCallback {
    constructor(public response: RefreshResponseType) {}
}

export class RefreshToken implements IApiRequest<RefreshTokenCallback> {
    public static getURL: string = Requests.REFRESHTOKEN;
    public URL: string = RefreshToken.getURL;
}
