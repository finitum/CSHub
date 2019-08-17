import { IApiRequest } from "../../../models";

import { Requests } from "../../Requests";
import { IStudy } from "../../../entities/study";

export class GetStudiesCallback {
    constructor(public studies: IStudy[]) {}
}

export class Studies implements IApiRequest<GetStudiesCallback> {
    public static getURL: string = Requests.GETSTUDIES;

    public URL: string = Studies.getURL;

    /**
     * @see IApiRequest.response
     */
    response?: GetStudiesCallback;
}
