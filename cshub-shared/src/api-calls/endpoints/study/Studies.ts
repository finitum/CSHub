import { IApiRequest } from "../../../models";

import { Requests } from "../../Requests";
import { IStudy } from "../../../entities/study";

export class GetStudiesCallback {
    constructor(public version: number, public studies: IStudy[]) {}
}

export class GetAllStudiesCallback {
    constructor(public studies: IStudy[]) {}
}

export class Studies implements IApiRequest<GetStudiesCallback> {
    public static getURL: string = Requests.GETSTUDIES;

    public static readonly studiesVersionHeader = "X-Studies-Version";

    public URL: string = Studies.getURL;

    public headers: { [key: string]: string } = {};

    constructor(studyVersion: number) {
        this.headers[Studies.studiesVersionHeader] = studyVersion.toString(10);
    }

    /**
     * @see IApiRequest.response
     */
    response?: GetStudiesCallback;
}

export class AllStudies implements IApiRequest<GetAllStudiesCallback> {
    public static getURL: string = Requests.GETALLSTUDIES;

    public URL: string = AllStudies.getURL;

    /**
     * @see IApiRequest.response
     */
    response?: GetStudiesCallback;
}
