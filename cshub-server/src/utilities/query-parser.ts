import { Request, Response } from "express";
import { ServerError } from "../../../cshub-shared/src/models/ServerError";

export function parseStringQuery(req: Request, res: Response, query: string): string | false {
    const queryParam = req.query[query];
    if (!queryParam || typeof queryParam !== "string") {
        res.send(400).json(new ServerError(`Invalid query param ${query}`));
        return false;
    }
    return queryParam;
}
