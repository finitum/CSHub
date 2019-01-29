import {IApiRequest} from "../../models/IApiRequest";
import {Requests} from "../Requests";

import {IEdit} from "../../models";

export class GetEditContentCallback {

    constructor(public edits: IEdit[]) {}
}

export class GetEditContent implements IApiRequest {

    public static getURL: string = Requests.EDITCONTENT;
    public URL: string = GetEditContent.getURL;

    constructor(
        public postHash: number,
        public includeLastEdit: boolean
    ) {}
}
