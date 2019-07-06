import {IApiRequest} from "../../../models";
import {Requests} from "../../Requests";

import {IEdit} from "../../../models";

export class GetEditContentCallback {

    constructor(public edits: IEdit[]) {}
}

export class EditContent implements IApiRequest {

    public static getURL: string = Requests.EDITCONTENT;
    public URL: string = EditContent.getURL;

    public headers: any = {};
    public static readonly excludeLastEditHeader = "X-Exclude-Last-Edit";

    constructor(postHash: number, includeLastEdit: boolean) {
        this.URL = this.URL.replace(/:hash/, postHash.toString());
        this.headers[EditContent.excludeLastEditHeader] = !includeLastEdit;
    }
}
