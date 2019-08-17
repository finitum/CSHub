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

export class AllStudies implements IApiRequest<GetStudiesCallback> {
    public static getURL: string = Requests.GETALLSTUDIES;

    public URL: string = AllStudies.getURL;

    /**
     * @see IApiRequest.response
     */
    response?: GetStudiesCallback;
}
