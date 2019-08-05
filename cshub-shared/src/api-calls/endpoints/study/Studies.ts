import {IApiRequest} from "../../../models";

import {Requests} from "../../Requests";
import {Study} from "../../../../../cshub-server/src/db/entities/study";

export class GetStudiesCallback {

    constructor(
        public studies?: Study[]
    ) {}
}

export class Studies implements IApiRequest {

    public static getURL: string = Requests.STUDIES;

    public URL: string = Studies.getURL;
    }
