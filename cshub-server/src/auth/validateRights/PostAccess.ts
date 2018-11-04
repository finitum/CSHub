import {validateAccessToken} from "../JWTHandler";
import {DatabaseResultSet, query} from "../../utilities/DatabaseConnection";

export type postAccessType = {
    access: boolean,
    isOwner: boolean
};

// Test whether the user has enough rights to access this post; only admins have access to non-verified posts
export const hasAccessToPost = (postHash: number, jwt: string): Promise<postAccessType> => {
    const tokenResult = validateAccessToken(jwt);

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
