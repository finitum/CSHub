import {Request, Response} from "express";

import {app} from "../../index";

import {ForgotPasswordMail, ForgotPasswordMailCallback, ForgotPasswordMailResponseTypes} from "../../../../cshub-shared/src/api-calls";
import {customValidator} from "../../utilities/StringUtils";
import {DatabaseResultSet, query} from "../../utilities/DatabaseConnection";
import {sendPasswordResetMail} from "../../utilities/MailConnection";

app.post(ForgotPasswordMail.getURL, (req: Request, res: Response) => {

    const forgotPassword = req.body as ForgotPasswordMail;

    // Checking the input, see createaccount for a (bit) more in depth explanation
    if (customValidator({input: forgotPassword.email}).valid) {
        query(`
            SELECT id, firstname
            FROM users
            WHERE email = ?
        `, forgotPassword.email)
            .then((resDatabase: DatabaseResultSet) => {
                if (resDatabase.convertRowsToResultObjects().length > 0) {
                    sendPasswordResetMail(forgotPassword.email, resDatabase.getStringFromDB("firstname"), resDatabase.getNumberFromDB("id"));
                    res.json(new ForgotPasswordMailCallback(ForgotPasswordMailResponseTypes.SENT));
                } else {
                    res.json(new ForgotPasswordMailCallback(ForgotPasswordMailResponseTypes.EMAILDOESNTEXIST));
                }
            })
    } else {
        res.json(new ForgotPasswordMailCallback(ForgotPasswordMailResponseTypes.INVALIDINPUT));
    }
});
