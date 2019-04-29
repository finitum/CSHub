import {IApiRequest} from "../../models/IApiRequest";
import {Requests} from "../Requests";

import {IEdit} from "../../models";

export class GetEditContentCallback {

    constructor(public edits: IEdit[]) {}
}

export class GetEditContent implements IApiRequest {

    public static getURL: string = Requests.EDITCONTENT;
    public URL: string = GetEditContent.getURL;

    public headers: any = {};
    public static readonly excludeLastEditHeader = "X-Exclude-Last-Edit";

    constructor(postHash: number, includeLastEdit: boolean) {
        this.URL = this.URL.replace(/:hash/, postHash.toString());
        this.headers[GetEditContent.excludeLastEditHeader] = !includeLastEdit;
    }
}
