import { Request, Response } from "express";

import { app } from "../../index";

import {
    ForgotPassword,
    ForgotPasswordCallback,
    ForgotPasswordResponseTypes
} from "../../../../cshub-shared/src/api-calls";
import { validateMultipleInputs } from "../../utilities/StringUtils";
import { DatabaseResultSet, query } from "../../db/database-query";
import { hashPassword } from "../../auth/HashPassword";

app.post(ForgotPassword.getURL, (req: Request, res: Response) => {
    const forgotPassword = req.body as ForgotPassword;

    const validator = validateMultipleInputs(
        {
            input: forgotPassword.password,
            validationObject: {
                minlength: 8
            }
        },
        { input: forgotPassword.accId },
        { input: forgotPassword.hash }
    );

    // Checking the input, see createaccount for a (bit) more in depth explanation
    if (validator.valid) {
        query(
            `
            SELECT id
            FROM users
            WHERE id = ? AND passresethash = ?
        `,
            forgotPassword.accId,
            forgotPassword.hash
        ).then((resDatabase: DatabaseResultSet) => {
            if (resDatabase.convertRowsToResultObjects().length > 0) {
                hashPassword(forgotPassword.password)
                    .then((hashedValue: string) => {
                        return query(
                            `
                                UPDATE users
                                SET password = ?, passresethash = NULL
                                WHERE id = ?
                            `,
                            hashedValue,
                            forgotPassword.accId
                        );
                    })
                    .then(() => {
                        res.json(new ForgotPasswordCallback(ForgotPasswordResponseTypes.CHANGED));
                    });
            } else {
                res.status(400).json(new ForgotPasswordCallback(ForgotPasswordResponseTypes.INVALIDINPUT));
            }
        });
    } else {
        res.status(400).json(new ForgotPasswordCallback(ForgotPasswordResponseTypes.INVALIDINPUT));
    }
});
