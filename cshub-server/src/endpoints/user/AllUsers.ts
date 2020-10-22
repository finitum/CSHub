import { AllUsers, AllUsersCallBack } from "../../../../cshub-shared/src/api-calls";
import { Application, Request, Response } from "express";
import { checkTokenValidityFromRequest } from "../../auth/AuthMiddleware";
import { getRepository } from "typeorm";
import { User } from "../../db/entities/user";

export function registerAllUsersEndpoint(app: Application): void {
    app.get(AllUsers.getURL, (req: Request, res: Response) => {
        const page = Number(req.params.page);
        let rowsPerPage = Number(req.query.rowsPerPage);

        const token = checkTokenValidityFromRequest(req);

        // Check if token is valid and user is admin
        if (token && token.user.admin) {
            rowsPerPage = rowsPerPage === -1 ? 4242424242 : rowsPerPage;

            const userRepository = getRepository(User);

            userRepository
                .find({
                    relations: ["studies"],
                    skip: (page - 1) * rowsPerPage,
                    take: rowsPerPage,
                })
                .then((data) => {
                    userRepository.count().then((countResult) => {
                        res.json(new AllUsersCallBack(data, countResult));
                    });
                });
        } else {
            res.sendStatus(403);
        }
    });
}
