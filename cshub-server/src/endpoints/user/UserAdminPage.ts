import { app } from "../../index";
import { Request, Response } from "express";
import { checkTokenValidityFromRequest } from "../../auth/AuthMiddleware";
import {
    VerifyUser,
    BlockUser,
    SetAdminUser,
    SetStudyAdminUser,
} from "../../../../cshub-shared/src/api-calls/endpoints/user/UserAdminPage";
import { getRepository } from "typeorm";
import { User } from "../../db/entities/user";
import logger from "../../utilities/Logger";
import { query } from "../../db/database-query";

app.put(VerifyUser.putURL, async (req: Request, res: Response) => {
    const userObj = checkTokenValidityFromRequest(req);
    const verifyUserRequest: VerifyUser = req.body as VerifyUser;
    const userRepository = getRepository(User);

    if (userObj === false) {
        return res.sendStatus(401);
    }

    if (!userObj.user.admin) {
        return res.sendStatus(403);
    }

    if (userObj.user.id == verifyUserRequest.user.id) {
        return res.sendStatus(403);
    }

    try {
        await userRepository.update(verifyUserRequest.user.id, { verified: verifyUserRequest.verified });
    } catch (err) {
        logger.error(err);
        return res.sendStatus(500);
    }

    res.sendStatus(201);
});

app.put(SetAdminUser.putURL, async (req: Request, res: Response) => {
    const userObj = checkTokenValidityFromRequest(req);
    const setAdminUserRequest: SetAdminUser = req.body as SetAdminUser;
    const userRepository = getRepository(User);

    if (userObj === false) {
        return res.sendStatus(401);
    }

    if (!userObj.user.admin) {
        return res.sendStatus(403);
    }

    if (userObj.user.id == setAdminUserRequest.user.id) {
        return res.sendStatus(403);
    }

    try {
        await userRepository.update(setAdminUserRequest.user.id, { admin: setAdminUserRequest.admin });
    } catch (err) {
        logger.error(err);
        return res.sendStatus(500);
    }

    res.sendStatus(201);
});

app.put(BlockUser.putURL, async (req: Request, res: Response) => {
    const userObj = checkTokenValidityFromRequest(req);
    const blockUserRequest: BlockUser = req.body as BlockUser;
    const userRepository = getRepository(User);

    if (userObj === false) {
        return res.sendStatus(401);
    }

    if (!userObj.user.admin) {
        return res.sendStatus(403);
    }

    if (userObj.user.id == blockUserRequest.user.id) {
        return res.sendStatus(403);
    }

    try {
        await userRepository.update(blockUserRequest.user.id, { blocked: blockUserRequest.blocked });
    } catch (err) {
        logger.error(err);
        return res.sendStatus(500);
    }

    res.sendStatus(201);
});

app.put(SetStudyAdminUser.putURL, async (req: Request, res: Response) => {
    const userObj = checkTokenValidityFromRequest(req);
    const setStudyAdminUserRequest: SetStudyAdminUser = req.body as SetStudyAdminUser;

    if (userObj === false) {
        return res.sendStatus(401);
    }

    if (!userObj.user.admin) {
        return res.sendStatus(403);
    }

    if (userObj.user.id == setStudyAdminUserRequest.user.id) {
        return res.sendStatus(403);
    }

    try {
        await query(
            `
                DELETE FROM studies_admins_users
                WHERE usersId = ?
            `,
            setStudyAdminUserRequest.user.id,
        );

        for (const study of setStudyAdminUserRequest.studies) {
            await query(
                `
                INSERT INTO  studies_admins_users
                SET usersId = ?,
                    studiesId = ?
            `,
                setStudyAdminUserRequest.user.id,
                study,
            );
        }
    } catch (err) {
        logger.error(err);
        return res.sendStatus(500);
    }

    res.sendStatus(201);
});
