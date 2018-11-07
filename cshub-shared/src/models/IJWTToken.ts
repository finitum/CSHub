import {IUser} from "./IUser";

export interface IJWTToken {
    user: IUser;
    expirydate: number;
}
