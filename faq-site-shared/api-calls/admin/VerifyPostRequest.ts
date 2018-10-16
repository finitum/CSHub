import {IApiRequest, IUser} from "../../models";
import {AdminRequests} from "../AdminRequests";

export class VerifyPostCallBack {
}

export class VerifyPostRequest implements IApiRequest {
    public static getURL: string = AdminRequests.VERIFYPOST;
    public URL: string = VerifyPostRequest.getURL;

    constructor(public postHash: number) {}
}
