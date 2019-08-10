import { IApiRequest } from "../../../models";
import { Requests } from "../../Requests";
import { IUser } from "../../../entities/user";

export class AllUsersCallBack {
    constructor(public users: IUser[], public totalItems: number) {}
}

export class AllUsers implements IApiRequest {
    public static getURL: string = Requests.ALLUSERS;
    public URL: string = AllUsers.getURL;

    constructor(rowsPerPage: number, page: number) {
        this.URL = this.URL.replace(/:page/, page.toString());
        this.URL += "?rowsPerPage=" + rowsPerPage;
    }
}
