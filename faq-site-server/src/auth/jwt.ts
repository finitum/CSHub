import jwt from "jsonwebtoken";

import {UserModel} from "../../../faq-site-shared/models/UserModel";

import {secretKey} from "./jwt-key";

export const sign = (obj: UserModel): string => {
    return jwt.sign(obj, secretKey);
};

export const validateAccessToken = (accessToken: string) => {
    try {
        return jwt.verify(accessToken, secretKey) as UserModel;
    } catch (e) {
        // console.warn('Dropping unverified accessToken', e);
    }
};
