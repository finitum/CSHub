import { IApiRequest } from "../../../models";

import { Requests } from "../../Requests";
import { IStudy } from "../../../entities/study";

export class HideStudies implements IApiRequest<void> {
    public static postURL: string = Requests.HIDESTUDIES;

    public URL: string = HideStudies.postURL;

    constructor(public study: IStudy) {}
}

export class UnhideStudies implements IApiRequest<void> {
    public static postURL: string = Requests.UNHIDESTUDIES;

    public URL: string = UnhideStudies.postURL;

    constructor(public study: IStudy) {}
}
