import {IApiRequest} from "../../../models/IApiRequest";

import {AuthRequests} from "../../AuthRequests";

export class UserDashboardCallBack {

    constructor(
        public postHashes: number[]
    ) {}
}

export class UserDashboardRequest implements IApiRequest {

    public static getURL: string = AuthRequests.DASHBOARD;
    public URL: string = UserDashboardRequest.getURL;

    constructor(public startFromResult: number) {}
}
