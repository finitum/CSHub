import {IApiRequest, IUser} from "../../models";
import {AdminRequests} from "../AdminRequests";

export class GetAllUsersCallBack {

    constructor(
        public users: IUser[],
        public totalItems: number
    ) {}
}

export class GetAllUsersRequest implements IApiRequest {
    public static getURL: string = AdminRequests.GETALLUSERS;
    public URL: string = GetAllUsersRequest.getURL;

    constructor(public rowsPerPage: number, public page: number) {}
}
