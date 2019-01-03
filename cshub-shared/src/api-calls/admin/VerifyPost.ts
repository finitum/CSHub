import {IApiRequest, IUser} from "../../models";
import {Requests} from "../Requests";

export class VerifyPostCallBack {
}

export class VerifyPost implements IApiRequest {
    public static getURL: string = Requests.VERIFYPOST;
    public URL: string = VerifyPost.getURL;

    constructor(public postHash: number, public verify: boolean) {}
}
