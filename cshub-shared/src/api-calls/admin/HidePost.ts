import {IApiRequest, IUser} from "../../models";
import {Requests} from "../Requests";

export class HidePostCallBack {
}

export class HidePost implements IApiRequest {
    public static getURL: string = Requests.VERIFYPOST;
    public URL: string = HidePost.getURL;

    constructor(public postHash: number) {}
}
