import { IApiRequest } from "../../../models";
import { Requests } from "../../Requests";

export class SquashEdits implements IApiRequest {
    public static getURL: string = Requests.SQUASHEDITS;
    public URL: string = SquashEdits.getURL;

    constructor(postHash: number, public editIds: number[]) {
        this.URL = this.URL.replace(/:hash/, postHash.toString());
    }
}
