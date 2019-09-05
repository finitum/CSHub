import { Request, Response } from "express";

import { app } from "../../index";
import logger from "../..//utilities/Logger";
import { Settings } from "../../settings";

import { Login, LoginCallBack, LoginResponseTypes, Logout } from "../../../../cshub-shared/src/api-calls/index";

import { sign } from "../../auth/JWTHandler";
import { customValidator } from "../../utilities/StringUtils";
import { hashPassword } from "../../auth/HashPassword";
import { getRepository } from "typeorm";
import { User } from "../../db/entities/user";

app.post(Logout.getURL, (req: Request, res: Response) => {
    res.clearCookie("token", {
        maxAge: Settings.TOKENAGEMILLISECONDS,
        domain: Settings.DOMAIN
    }).send();
});

app.post(Login.getURL, async (req: Request, res: Response) => {
    const loginRequest = req.body as Login;

    // Checking the input, see createaccount for a (bit) more in depth explanation
    if (
        !customValidator({ input: loginRequest.password }).valid ||
        !customValidator({ input: loginRequest.email }).valid
    ) {
        return res.status(400).json(new LoginCallBack(LoginResponseTypes.INVALIDINPUT));
    }

    // If the input is actually valid, check if the password entered is equal. Depending on the output of the server, provide the correct error or login.
    let hashedValue;
    try {
        hashedValue = await hashPassword(loginRequest.password);
    } catch (err) {
        logger.error(`Hashing password for logging into account failed`);
        logger.error(err);
        res.status(500).send();
    }

    const userRepository = getRepository(User);

    let possibleUsers;
    try {
        possibleUsers = await userRepository.find({
            relations: ["studies"],
            where: {
                email: loginRequest.email.trim(),
                domain: loginRequest.domain
            }
        });
    } catch (err) {
        logger.error(`Login query failed: ${err}`);
        logger.error(err);
        return res.sendStatus(500);
    }

    if (possibleUsers.length === 0) {
        return res.json(new LoginCallBack(LoginResponseTypes.INCORRECTPASS));
    }

    const user = possibleUsers[0];
    if (user.password !== hashedValue) {
        return res.json(new LoginCallBack(LoginResponseTypes.INCORRECTPASS));
    }

    if (user.blocked) {
        return res.json(new LoginCallBack(LoginResponseTypes.ACCOUNTBLOCKED));
    }

    if (!user.verified) {
        return res.json(new LoginCallBack(LoginResponseTypes.ACCOUNTNOTVERIFIED));
    }

    const jwt = sign(user);

    // Sign a JWT token which has the usermodel, on this way, we don't have to check in the database when we get a request from the user, we just verify the JWT token, which contains the userModel.
    // Also, the token is only valid for 2 hours (7200000)
    res.cookie("token", jwt, {
        maxAge: Settings.TOKENAGEMILLISECONDS,
        domain: Settings.DOMAIN
    });

    return res.json(new LoginCallBack(LoginResponseTypes.SUCCESS, user));
});
