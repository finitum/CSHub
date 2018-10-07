import {validateAccessToken} from "../jwt";
import {DatabaseResultSet, query} from "../../database-connection";

export const hasAccessToPost = (postId: number, jwt: string): Promise<boolean> => {
    const tokenResult = validateAccessToken(jwt);

    if (tokenResult.user.rank === 2) {
        return new Promise((resolve, reject) => { resolve(true); });
    } else {
        return query(`
            SELECT approved
            FROM posts
            WHERE id = ?
        `, postId)
            .then((databaseResult: DatabaseResultSet) => databaseResult.getNumberFromDB("approved") !== 0);
    }
};
