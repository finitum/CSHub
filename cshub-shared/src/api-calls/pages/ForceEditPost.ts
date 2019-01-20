import {IApiRequest} from "../../models/IApiRequest";

import {Requests} from "../Requests";

export class ForceEditPostCallback {
    constructor() {}
}

export class ForceEditPost implements IApiRequest {

    public static getURL: string = Requests.FORCEEDITPOST;
    public URL: string = ForceEditPost.getURL;

    constructor(
        public postHash: number
    ) {}
}
