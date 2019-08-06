import {DatabaseResultSet, query} from "../../db/database-query";
import {checkTokenValidityFromJWT} from "../AuthMiddleware";
import {Request} from "express";
import {getStudiesFromTopic} from "../../utilities/TopicsUtils";

export type postAccessType = {
    canEdit: boolean,
    canSave: boolean
};

export const hasAccessToPostRequest = (postHash: number, req: Request): Promise<postAccessType> => {

    if (req.cookies === null) {
        return Promise.resolve({canEdit: false, canSave: false});
    }

    return hasAccessToPostJWT(postHash, req.cookies["token"]);
};

// Test whether the user has enough rights to access this post
// A (study) admin has the ability to save
export const hasAccessToPostJWT = (postHash: number, jwt: string): Promise<postAccessType> => {

    const tokenResult = checkTokenValidityFromJWT(jwt);

    return query(`
      SELECT deleted, t.hash
      FROM posts p
        INNER JOIN topics t on p.topic = t.id
      WHERE p.hash = ?
    `, postHash)
        .then((databaseResult: DatabaseResultSet) => {
            if (databaseResult.getNumberFromDB("deleted") === 1) {
                return {canEdit: false, canSave: false};
            }

            // Check if user is global admin
            if (tokenResult.valid &&
                tokenResult.tokenObj &&
                tokenResult.tokenObj.user.admin) {
                return {canEdit: true, canSave: true};
            }

            // Check if user is study admin
            return getStudiesFromTopic(databaseResult.getNumberFromDB("hash"))
                .then(studies => {
                    if (tokenResult.valid &&
                        tokenResult.tokenObj
                    ) {
                        for (const study of studies) {
                            const studyIndex = tokenResult.tokenObj.user.studies.findIndex(value => value.id === study.id);
                            if (studyIndex !== -1) {
                                return {canEdit: true, canSave: true};
                            }
                        }
                    }

                    return {canEdit: true, canSave: false};
                });
        });
};
