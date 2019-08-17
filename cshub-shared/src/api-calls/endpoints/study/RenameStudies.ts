import { IApiRequest } from "../../../models";
import { Requests } from "../../Requests";
import { IStudy } from "../../../entities/study";

export class RenameStudies implements IApiRequest<void> {
    public static postURL: string = Requests.RENAMESTUDIES;

    public URL: string = RenameStudies.postURL;

    constructor(public study: IStudy) {}
}
