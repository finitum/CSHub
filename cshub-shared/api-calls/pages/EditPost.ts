import {IApiRequest} from "../../models/IApiRequest";

import {AuthRequests} from "../AuthRequests";

export class EditPostCallback {
}

export class EditPost implements IApiRequest {

    public static getURL: string = AuthRequests.EDITPOST;
    public URL: string = EditPost.getURL;

    constructor(
        public postHash: number,
        public postBody: object
    ) {}
}
