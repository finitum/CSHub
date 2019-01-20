import {validateAccessToken} from "../JWTHandler";
import {DatabaseResultSet, query} from "../../utilities/DatabaseConnection";
import dayjs from "dayjs";

export type postAccessType = {
    access: boolean,
    isOwner: boolean,
    editRights: boolean
};

// Test whether the user has enough rights to access this post; only admins have access to non-verified posts
export const hasAccessToPost = (postHash: number, jwt: string): Promise<postAccessType> => {

    let isLoggedIn = true;

    if (jwt === null || jwt === undefined) {
        isLoggedIn = false;
    }

    const tokenResult = validateAccessToken(jwt);

    if (typeof tokenResult !== "undefined") {
        if (dayjs(tokenResult.expirydate * 1000).isBefore(dayjs())) {
            isLoggedIn = false;
        } else {
            isLoggedIn = !tokenResult.user.blocked && tokenResult.user.verified;
        }
    } else {
        isLoggedIn = false;
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
                return {access: false, isOwner: false, editRights: false};
            }

            if (typeof tokenResult !== "undefined" && isLoggedIn && tokenResult.user.admin) {
                return {access: true, isOwner: true, editRights: true};
            }

            if (typeof tokenResult !== "undefined" && isLoggedIn && tokenResult.user.id === databaseResult.getNumberFromDB("author")) {
                return {access: true, isOwner: true, editRights: true};
            }

            const editCount = databaseResult.getNumberFromDB("editCount");
            if (editCount !== null || editCount > 1) {
                return {access: true, isOwner: false, editRights: isLoggedIn};
            } else {
                return {access: false, isOwner: false, editRights: false};
            }
        });



};
