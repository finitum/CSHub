import {IApiRequest, IUser} from "../../models";
import {AdminRequests} from "../AdminRequests";

export class GetAllUsersCallBack {

    constructor(
        public users: IUser[],
        public totalItems: number
    ) {}
}

export class GetAllUsers implements IApiRequest {
    public static getURL: string = AdminRequests.GETALLUSERS;
    public URL: string = GetAllUsers.getURL;

    constructor(public rowsPerPage: number, public page: number) {}
}
