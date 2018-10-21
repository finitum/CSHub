import sgMail from "@sendgrid/mail";
import nodemailer from "nodemailer";

import * as fs from "fs";
import {ClientResponse} from "@sendgrid/client/src/response";

import {Settings} from "../settings";
import {query} from "./database-connection";
import {logger} from "../index";
import {NonAuthRequests} from "../../../faq-site-shared/api-calls/index";

sgMail.setApiKey(Settings.MAIL.APIKEY);
const nodeMailer = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: Settings.MAIL.GMAILSETTINGS.MAILADDRESS,
        pass: Settings.MAIL.GMAILSETTINGS.PASSWORD
    }
});

export const sendMail = (subject: string, html: string, to: string) => {
    
    const emailObj = {
        to,
        subject,
        html
    };

    if (Settings.MAIL.USEGMAIL) {
        emailObj["from"] = Settings.MAIL.GMAILSETTINGS.MAILADDRESS;
        nodeMailer.sendMail(emailObj, function (err, info) {
            if (err){
                logger.error(`Mail sending failed`);
                logger.error(err);
            }
            else {
                logger.info("Mail sent: ");
                logger.info(info);
            }
        });

    } else {
        emailObj["from"] = Settings.MAIL.NOREPLYADDRESS;
        sgMail.send(emailObj)
            .then((response: [ClientResponse, {}]) => {
                logger.info("Mail sent: ");
                logger.info(response[0]);
            })
            .catch(err => {
                logger.error(`Mail sending failed`);
                logger.error(err);
            });
    }
};

export const sendVerificationEmail = (to: string, name: string, insertId: number) => {
    const hash = parseInt((Math.random() * 1000000000).toString(), 10);

    query(`
      UPDATE users
      SET verifyhash = ?
      WHERE id = ?
    `, hash, insertId)
        .then(() => {
            fs.readFile(`${__dirname}/verifyMailHTML.html`, "utf8", (err, html: string) => {
                const replaceToAddress = `${Settings.MAIL.VERIFYMAILADDRESSPREFIX + NonAuthRequests.VERIFYMAIL}?hash=${hash}&accId=${insertId}`;
                const newHTML = html.replace("{0}", name).replace("{1}", replaceToAddress);

                logger.info(`Replaced address; ${replaceToAddress}`);

                if (Settings.LIVE) {
                    if (Settings.MAIL.SUFFIX.charAt(0) === "@") {
                        sendMail("Verify your email address", newHTML, to + Settings.MAIL.SUFFIX);
                    } else {
                        logger.error("Wrong suffix entered, mail not sent");
                    }
                } else {
                    sendMail("Verify your email address", newHTML, Settings.MAIL.DEBUGMAILADDRESS);
                }
            });
        });

};
