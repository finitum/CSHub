import {IApiRequest} from "../../../models";

import {Requests} from "../../Requests";

export enum ChangePasswordResponseTypes {
    INVALIDINPUT,
    SUCCESS,
    WRONGPASSWORD
}

export class ChangePasswordCallback {

    constructor(
        public response: ChangePasswordResponseTypes
    ) {}
}

export class ChangePassword implements IApiRequest {

    public static getURL: string = Requests.CHANGEPASSWORD;
    public URL: string = ChangePassword.getURL;

    constructor(public currentPassword: string,
                public newPassword: string) {}
}
