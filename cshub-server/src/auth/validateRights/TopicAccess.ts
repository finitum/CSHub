import { Request } from "express";
import { checkTokenValidityFromJWT } from "../AuthMiddleware";
import { getStudiesFromTopic } from "../../utilities/TopicsUtils";

export const canCreateTopicRequest = (parentHash: number, req: Request): Promise<boolean> => {
    if (req.cookies === null) {
        return Promise.reject(false);
    }
    return canCreateTopicJWT(parentHash, req.cookies["token"]);
};

// Test whether the user has enough rights to access this post
// A (study) admin has the ability to save
export const canCreateTopicJWT = (parentHash: number, jwt: string): Promise<boolean> => {
    const tokenResult = checkTokenValidityFromJWT(jwt);

    if (tokenResult && tokenResult.user.admin) {
        return Promise.resolve(true);
    }

    return getStudiesFromTopic(parentHash).then(studies => {
        if (tokenResult) {
            for (const study of studies) {
                const studyIndex = tokenResult.user.studies.findIndex(value => value.id === study.id);
                if (studyIndex !== -1) {
                    return true;
                }
            }
        }

        return false;
    });
};
