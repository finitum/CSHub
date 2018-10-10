import {IApiRequest} from "../../../models/IApiRequest";

import {AuthRequests} from "../../AuthRequests";

export enum UserDashboardChangePasswordResponses {
    INVALIDINPUT,
    SUCCESS,
    WRONGPASSWORD
}

export class UserDashboardChangePasswordCallBack {

    constructor(
        public respose: UserDashboardChangePasswordResponses
    ) {}
}

export class UserDashboardChangePasswordRequest implements IApiRequest {

    public static getURL: string = AuthRequests.CHANGEPASSWORD;
    public URL: string = UserDashboardChangePasswordRequest.getURL;

    constructor(public currentPassword: string,
                public newPassword: string) {}
}
