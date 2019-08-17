import { IApiRequest } from "../../../models";

import { Requests } from "../../Requests";
import { IStudy } from "../../../entities/study";

export class CreateStudiesCallback {
    constructor(public study: IStudy) {}
}

export class CreateStudies implements IApiRequest<CreateStudiesCallback> {
    public static postURL: string = Requests.CREATESTUDIES;

    public URL: string = CreateStudies.postURL;

    constructor(public name: string, public hidden: boolean) {}
    /**
     * @see IApiRequest.response
     */
    response?: CreateStudiesCallback;
}
