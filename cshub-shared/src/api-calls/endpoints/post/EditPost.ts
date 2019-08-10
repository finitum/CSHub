import { IApiRequest } from "../../../models";

import { Requests } from "../../Requests";

export class EditPost implements IApiRequest {
    public static getURL: string = Requests.EDITPOST;
    public URL: string = EditPost.getURL;

    constructor(postHash: number, public postTitle: string, public postTopicHash: number, public deleteEdit: boolean) {
        this.URL = this.URL.replace(/:hash/, postHash.toString());
    }
}
