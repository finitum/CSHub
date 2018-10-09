import jwt from "jsonwebtoken";
import moment from "moment";

import {IUser} from "../../../faq-site-shared/models/IUser";
import {IJWTToken} from "../../../faq-site-shared/models/IJWTToken";

import {secretKey} from "./jwt-key";
import {Settings} from "../settings";

// Sign the object, add the expirydate of 2 hours and then convert to unix timeformat
export const sign = (obj: IUser): string => {

    const jwtobj: IJWTToken = {
        user: obj,
        expirydate: moment().add(Settings.TOKENAGEMILLISECONDS, "ms").unix()
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
