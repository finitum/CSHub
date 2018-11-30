import {IApiRequest} from "../../../models/IApiRequest";

import {Requests} from "../../Requests";

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

    public static getURL: string = Requests.CHANGEPASSWORD;
    public URL: string = ChangeUserPassword.getURL;

    constructor(public currentPassword: string,
                public newPassword: string) {}
}
