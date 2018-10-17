import {IApiRequest} from "../../models/IApiRequest";

import {AuthRequests} from "../AuthRequests";

export class EditPostCallback {
}

export class EditPostRequest implements IApiRequest {

    public static getURL: string = AuthRequests.EDITPOST;
    public URL: string = EditPostRequest.getURL;

    constructor(
        public postHash: number,
        public postBody: object
    ) {}
}
