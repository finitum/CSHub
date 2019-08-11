import jwt from "jsonwebtoken";
import dayjs from "dayjs";

import { IJWTToken } from "../../../cshub-shared/src/models";
import { IUser } from "../../../cshub-shared/src/entities/user";

import { Settings } from "../settings";

// Sign the object, add the expirydate of 2 hours and then convert to unix timeformat
export const sign = (obj: IUser): string => {
    const newObj: IUser = JSON.parse(JSON.stringify(obj));
    newObj.avatar = "";

    const jwtobj: IJWTToken = {
        user: newObj,
        expirydate: dayjs()
            .add(Settings.TOKENAGEMILLISECONDS, "millisecond")
            .unix()
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
