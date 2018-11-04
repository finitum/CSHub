import {IApiRequest} from "../../models/IApiRequest";
import {AuthRequests} from "../AuthRequests";

import {IEdit} from "../../models";

export class GetEditContentCallback {

    constructor(public edits: IEdit[]) {}
}

export class GetEditContent implements IApiRequest {

    public static getURL: string = AuthRequests.EDITCONTENT;
    public URL: string = GetEditContent.getURL;

    constructor(
        public postHash: number
    ) {}
}
