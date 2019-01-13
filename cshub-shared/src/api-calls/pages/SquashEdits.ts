import {IApiRequest} from "../../models/IApiRequest";
import {Requests} from "../Requests";

export class SquashEditsCallback {

    constructor(
    ) {}
}

export class SquashEdits implements IApiRequest {

    public static getURL: string = Requests.SQUASHEDITS;
    public URL: string = SquashEdits.getURL;

    constructor(public postHash: number, public editIds: number[]) {}
}
