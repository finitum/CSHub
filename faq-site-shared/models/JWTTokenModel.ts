import {UserModel} from "./UserModel";

export interface JWTTokenModel {
    user: UserModel;
    expirydate: number;
}
