import {IApiRequest, IUser} from "../../models";
import {Requests} from "../Requests";

export class GetAllUsersCallBack {

    constructor(
        public users: IUser[],
        public totalItems: number
    ) {}
}

export class GetAllUsers implements IApiRequest {
    public static getURL: string = Requests.GETALLUSERS;
    public URL: string = GetAllUsers.getURL;

    constructor(public rowsPerPage: number, public page: number) {}
}
