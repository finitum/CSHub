import {validateAccessToken} from "../JWTHandler";
import {DatabaseResultSet, query} from "../../utilities/DatabaseConnection";
import dayjs from "dayjs";

export type postAccessType = {
    access: boolean,
    isOwner: boolean
};

// Test whether the user has enough rights to access this post; only admins have access to non-verified posts
export const hasAccessToPost = (postHash: number, jwt: string): Promise<postAccessType> => {
    if (jwt === null || jwt === undefined) {
        return new Promise((resolve, reject) => { resolve({access: false, isOwner: false}); });
    }

    const tokenResult = validateAccessToken(jwt);

    if (dayjs(tokenResult.expirydate * 1000).isBefore(dayjs())) {
        return new Promise((resolve, reject) => { resolve({access: false, isOwner: false}); });
    }

    if (tokenResult !== undefined && tokenResult.user.admin) {
        return new Promise((resolve, reject) => { resolve({access: true, isOwner: true}); });
    } else {
        return query(`
            SELECT approved, author
            FROM posts
            WHERE hash = ?
        `, postHash)
            .then((databaseResult: DatabaseResultSet) => {
                if (tokenResult !== undefined && tokenResult.user.id === databaseResult.getNumberFromDB("author")) {
                    return {access: true, isOwner: true};
                }
                return {access: databaseResult.getNumberFromDB("approved") !== 0, isOwner: false};
            });
    }
};
