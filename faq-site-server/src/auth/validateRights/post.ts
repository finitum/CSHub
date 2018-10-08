import {validateAccessToken} from "../jwt";
import {DatabaseResultSet, query} from "../../database-connection";

// Test whether the user has enough rights to access this post; only admins have access to non-verified posts
export const hasAccessToPost = (postHash: number, jwt: string): Promise<boolean> => {
    const tokenResult = validateAccessToken(jwt);

    if (tokenResult !== undefined && tokenResult.user.admin) {
        return new Promise((resolve, reject) => { resolve(true); });
    } else {
        return query(`
            SELECT approved
            FROM posts
            WHERE hash = ?
        `, postHash)
            .then((databaseResult: DatabaseResultSet) => databaseResult.getNumberFromDB("approved") !== 0);
    }
};
