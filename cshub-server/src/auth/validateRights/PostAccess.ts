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
        return new Promise((resolve, reject) => {
            resolve({access: false, isOwner: false});
        });
    }

    const tokenResult = validateAccessToken(jwt);

    if (tokenResult !== undefined) {
        if (dayjs(tokenResult.expirydate * 1000).isBefore(dayjs())) {
            return new Promise((resolve, reject) => {
                resolve({access: false, isOwner: false});
            });
        }

        return query(`
          SELECT deleted, author, editCount
          FROM posts
                 LEFT JOIN (
            SELECT COUNT(*) AS editCount, post
            FROM edits
            GROUP BY post
          ) e on posts.id = e.post
          WHERE hash = ?
        `, postHash)
            .then((databaseResult: DatabaseResultSet) => {
                if (databaseResult.getNumberFromDB("deleted") === 1) {
                    return {access: false, isOwner: false};
                }

                if (tokenResult.user.admin) {
                    return {access: true, isOwner: true};
                }

                if (tokenResult.user.id === databaseResult.getNumberFromDB("author")) {
                    return {access: true, isOwner: true};
                }

                const editCount = databaseResult.getNumberFromDB("editCount");
                if (editCount !== null || editCount > 1) {
                    return {access: true, isOwner: false};
                } else {
                    return {access: false, isOwner: false};
                }
            });
    }


};
