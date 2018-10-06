import jwt from "jsonwebtoken";
import moment from "moment";

import {IUser} from "../../../faq-site-shared/models/IUser";
import {IJWTToken} from "../../../faq-site-shared/models/IJWTToken";

import {secretKey} from "./jwt-key";

export const sign = (obj: IUser): string => {

    const jwtobj: IJWTToken = {
        user: obj,
        expirydate: moment().add(2, "h").unix()
    };

    return jwt.sign(jwtobj, secretKey);
};

export const validateAccessToken = (accessToken: string) => {
    try {
        return jwt.verify(accessToken, secretKey) as IJWTToken;
    } catch (e) {
        // console.warn('Dropping unverified accessToken', e);
    }
};
