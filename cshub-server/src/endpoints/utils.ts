import { classToPlain } from "class-transformer";
import mung from "express-mung";
import { Application } from "express";

export function addClassTransformMiddleware(app: Application): void {
    app.use(
        mung.json(function transform(body: any) {
            return classToPlain(body);
        }),
    );
}

export class AlreadySentError extends Error {}
