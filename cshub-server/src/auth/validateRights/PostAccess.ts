import { DatabaseResultSet, query } from "../../db/database-query";
import { checkTokenValidityFromJWT } from "../AuthMiddleware";
import { Request } from "express";
import { getStudiesFromTopic } from "../../utilities/TopicsUtils";

export interface PostAccessType {
    canEdit: boolean;
    canSave: boolean;
}

export const hasAccessToTopicRequest = (topicHash: number, req: Request): Promise<PostAccessType> => {
    if (req.cookies === null) {
        return Promise.resolve({ canEdit: false, canSave: false });
    }

    return hasAccessToTopicJWT(topicHash, req.cookies["token"]);
};

export const hasAccessToTopicJWT = (topicHash: number, jwt: string): Promise<PostAccessType> => {
    const tokenResult = checkTokenValidityFromJWT(jwt);

    // Check if user is global admin
    if (tokenResult && tokenResult.user.admin) {
        return Promise.resolve({ canEdit: true, canSave: true });
    }

    // Check if user is study admin
    return getStudiesFromTopic(topicHash).then(studies => {
        if (tokenResult) {
            for (const study of studies) {
                const isStudyAdmin = tokenResult.user.studies.map(currStudy => currStudy.id).includes(study.id);
                if (isStudyAdmin) {
                    return { canEdit: true, canSave: true };
                }
            }
        }

        return { canEdit: true, canSave: false };
    });
};

export const hasAccessToPostRequest = (postHash: number, req: Request): Promise<PostAccessType> => {
    if (req.cookies === null) {
        return Promise.resolve({ canEdit: false, canSave: false });
    }

    return hasAccessToPostJWT(postHash, req.cookies["token"]);
};

// Test whether the user has enough rights to access this post
// A (study) admin has the ability to save
export const hasAccessToPostJWT = (postHash: number, jwt: string): Promise<PostAccessType> => {
    return query(
        `
      SELECT deleted, t.hash
      FROM posts p
        INNER JOIN topics t on p.topic = t.id
      WHERE p.hash = ?
    `,
        postHash
    ).then((databaseResult: DatabaseResultSet) => {
        if (databaseResult.getNumberFromDB("deleted") === 1) {
            return { canEdit: false, canSave: false };
        }

        return hasAccessToTopicJWT(databaseResult.getNumberFromDB("hash"), jwt);
    });
};
