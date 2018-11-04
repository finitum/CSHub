import {IApiRequest, IUser} from "../../models";
import {AdminRequests} from "../AdminRequests";

export class VerifyPostCallBack {
}

export class VerifyPost implements IApiRequest {
    public static getURL: string = AdminRequests.VERIFYPOST;
    public URL: string = VerifyPost.getURL;

    constructor(public postHash: number) {}
}
