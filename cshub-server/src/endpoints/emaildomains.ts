import {
    GetEmailDomains,
    GetEmailDomainsCallback,
    PostEmailDomains,
    DeleteEmailDomains,
    PutEmailDomains,
    PostEmailDomainsCallback,
} from "../../../cshub-shared/src/api-calls/endpoints";
import { Application, Request, Response } from "express";
import { getRepository } from "typeorm";
import { EmailDomain } from "../db/entities/emaildomain";
import { ServerError } from "../../../cshub-shared/src/models/ServerError";
import { checkTokenValidityFromRequest } from "../auth/AuthMiddleware";
import logger from "../utilities/Logger";

export function registerEmailDomainsEndpoints(app: Application): void {
    app.get(PutEmailDomains.getURL, async (req: Request, res: Response) => {
        const emailDomainsRepo = getRepository(EmailDomain);

        try {
            return res.status(200).json(new GetEmailDomainsCallback(await emailDomainsRepo.find()));
        } catch (err) {
            logger.error(err);
            return res.status(500).json(new ServerError("The server fucked up"));
        }
    });

    app.delete(PostEmailDomains.getURL, async (req: Request, res: Response) => {
        const authorized = checkTokenValidityFromRequest(req);
        if (!authorized) {
            return res.sendStatus(401);
        }

        if (!authorized.user.admin) {
            return res.sendStatus(403);
        }

        const emailDomainsRepo = getRepository(EmailDomain);

        const domain = req.body as DeleteEmailDomains;

        try {
            await emailDomainsRepo.delete({ id: domain.domainid });

            return res.sendStatus(200);
        } catch (err) {
            logger.error(err);
            return res.status(500).json(new ServerError("Something fucked up"));
        }
    });

    app.post(DeleteEmailDomains.getURL, async (req: Request, res: Response) => {
        const authorized = checkTokenValidityFromRequest(req);
        if (!authorized) {
            return res.sendStatus(401);
        }

        if (!authorized.user.admin) {
            return res.sendStatus(403);
        }

        const emailDomainsRepo = getRepository(EmailDomain);

        const domain = req.body as PostEmailDomains;

        try {
            const newDomain = await emailDomainsRepo.save({
                domain: domain.domain,
            });

            return res.status(200).json(new PostEmailDomainsCallback(newDomain));
        } catch (err) {
            logger.error(err);
            return res.status(500).json(new ServerError("Something fucked up"));
        }
    });

    app.put(GetEmailDomains.getURL, async (req: Request, res: Response) => {
        const authorized = checkTokenValidityFromRequest(req);
        if (!authorized) {
            return res.sendStatus(401);
        }

        if (!authorized.user.admin) {
            return res.sendStatus(403);
        }

        const emailDomainsRepo = getRepository(EmailDomain);

        const domain = req.body as PutEmailDomains;

        try {
            await emailDomainsRepo.update(
                { id: domain.domain.id },
                {
                    domain: domain.domain.domain,
                },
            );

            return res.sendStatus(200);
        } catch (err) {
            logger.error(err);
            return res.status(500).json(new ServerError("Something fucked up"));
        }
    });
}
