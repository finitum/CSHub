import {validateAccessToken} from "../jwt";
import {DatabaseResultSet, query} from "../../utilities/database-connection";

// Test whether the user has enough rights to access this post; only admins have access to non-verified posts
export const hasAccessToPost = (postHash: number, jwt: string): Promise<boolean> => {
    const tokenResult = validateAccessToken(jwt);

    if (tokenResult !== undefined && tokenResult.user.admin) {
        return new Promise((resolve, reject) => { resolve(true); });
    } else {
        return query(`
            SELECT approved, author
            FROM posts
            WHERE hash = ?
        `, postHash)
            .then((databaseResult: DatabaseResultSet) => {
                if (tokenResult !== undefined && tokenResult.user.id === databaseResult.getNumberFromDB("author")) {
                    return true;
                }
                return databaseResult.getNumberFromDB("approved") !== 0;
            });
    }
};
