import { IApiRequest } from "../../../models";

import { Requests } from "../../Requests";

export class HideStudies implements IApiRequest<void> {
    public static postURL: string = Requests.HIDESTUDIES;

    public URL: string = HideStudies.postURL;

    constructor(studyId: number) {
        this.URL = this.URL.replace(/:id/, studyId.toString());
    }
}

export class UnhideStudies implements IApiRequest<void> {
    public static postURL: string = Requests.UNHIDESTUDIES;

    public URL: string = UnhideStudies.postURL;

    constructor(studyId: number) {
        this.URL = this.URL.replace(/:id/, studyId.toString());
    }
}
