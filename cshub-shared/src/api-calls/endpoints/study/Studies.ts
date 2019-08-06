import {IApiRequest} from "../../../models";

import {Requests} from "../../Requests";
import {IStudy} from "../../../entities/study";

export class GetStudiesCallback {

    constructor(
        public studies?: IStudy[]
    ) {}
}

export class Studies implements IApiRequest {

    public static getURL: string = Requests.STUDIES;

    public URL: string = Studies.getURL;
    }
