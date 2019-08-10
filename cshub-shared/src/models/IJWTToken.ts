import { IUser } from "../entities/user";

export interface IJWTToken {
    user: IUser;
    expirydate: number;
}
