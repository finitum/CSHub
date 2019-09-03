import { IApiRequest } from "../../../models";
import { Requests } from "../../Requests";

export class RenameStudies implements IApiRequest<void> {
    public static postURL: string = Requests.RENAMESTUDIES;

    public URL: string = RenameStudies.postURL;

    constructor(studyId: number, public newName: string) {
        this.URL = this.URL.replace(/:id/, studyId.toString());
    }
}
