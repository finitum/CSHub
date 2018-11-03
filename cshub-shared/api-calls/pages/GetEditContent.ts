import {IApiRequest} from "../../models/IApiRequest";
import {AuthRequests} from "../AuthRequests";

// @ts-ignore
import Delta from "quill-delta/dist/Delta";

export class GetEditContentCallback {

    constructor(public deltas: Delta[]) {}
}

export class GetEditContent implements IApiRequest {

    public static getURL: string = AuthRequests.EDITCONTENT;
    public URL: string = GetEditContent.getURL;

    constructor(
        public postHash: number
    ) {}
}
