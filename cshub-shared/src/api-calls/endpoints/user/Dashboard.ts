import { IApiRequest } from "../../../models";

import { Requests } from "../../Requests";

export class DashboardCallback {
    constructor(public postHashes: number[]) {}
}

export class Dashboard implements IApiRequest {
    public static getURL: string = Requests.DASHBOARD;
    public URL: string = Dashboard.getURL;
}
