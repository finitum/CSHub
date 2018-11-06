import jwt from "jsonwebtoken";
import dayjs from "dayjs";

import {IUser} from "../../../cshub-shared/models/IUser";
import {IJWTToken} from "../../../cshub-shared/models/IJWTToken";

import {Settings} from "../settings";

// Sign the object, add the expirydate of 2 hours and then convert to unix timeformat
export const sign = (obj: IUser): string => {

    let newObj: IUser = JSON.parse(JSON.stringify(obj));
    newObj.avatar = "";

    const jwtobj: IJWTToken = {
        user: newObj,
        expirydate: dayjs().add(Settings.TOKENAGEMILLISECONDS, "millisecond").unix()
    };

    return jwt.sign(jwtobj, Settings.JWTHASH);
};

export const validateAccessToken = (accessToken: string) => {
    try {
        return jwt.verify(accessToken, Settings.JWTHASH) as IJWTToken;
    } catch (e) {
        // console.warn('Dropping unverified accessToken', e);
    }
};
