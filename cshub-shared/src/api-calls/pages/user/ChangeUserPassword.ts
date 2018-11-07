import {IApiRequest} from "../../../models/IApiRequest";

import {AuthRequests} from "../../AuthRequests";

export enum ChangeUserPasswordReponseTypes {
    INVALIDINPUT,
    SUCCESS,
    WRONGPASSWORD
}

export class ChangeUserPasswordCallback {

    constructor(
        public response: ChangeUserPasswordReponseTypes
    ) {}
}

export class ChangeUserPassword implements IApiRequest {

    public static getURL: string = AuthRequests.CHANGEPASSWORD;
    public URL: string = ChangeUserPassword.getURL;

    constructor(public currentPassword: string,
                public newPassword: string) {}
}
