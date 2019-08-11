import { app } from "../index";
import { classToPlain } from "class-transformer";
import mung from "express-mung";

app.use(
    mung.json(function transform(body: any) {
        return classToPlain(body);
    })
);
