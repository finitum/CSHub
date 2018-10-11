import {IApiRequest, IUser} from "../../models";
import {AdminRequests} from "../AdminRequests";

export class GetAllUsersRequest implements IApiRequest {
    public static getURL: string = AdminRequests.GETALLUSERS;
    public URL: string = GetAllUsersRequest.getURL;

}
