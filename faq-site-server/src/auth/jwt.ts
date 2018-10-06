import jwt from "jsonwebtoken";
import moment from "moment";

import {UserModel} from "../../../faq-site-shared/models/UserModel";
import {JWTTokenModel} from "../../../faq-site-shared/models/JWTTokenModel";

import {secretKey} from "./jwt-key";

export const sign = (obj: UserModel): string => {

    const jwtobj: JWTTokenModel = {
        user: obj,
        expirydate: moment().add(2, "h").unix()
    };

    return jwt.sign(jwtobj, secretKey);
};

export const validateAccessToken = (accessToken: string) => {
    try {
        return jwt.verify(accessToken, secretKey) as JWTTokenModel;
    } catch (e) {
        // console.warn('Dropping unverified accessToken', e);
    }
};
