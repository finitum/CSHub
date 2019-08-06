import {IUser} from "./user";
import {IEdit} from "./edit";

export interface IEditUser {

    id?: number;

    edit?: IEdit;

    user?: IUser;
}
