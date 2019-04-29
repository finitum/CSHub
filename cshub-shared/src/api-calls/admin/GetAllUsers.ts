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

    constructor(rowsPerPage: number, page: number) {
        this.URL = this.URL.replace(/:page/, page.toString());
        this.URL += "?rowsPerPage=" + rowsPerPage;
    }
}
