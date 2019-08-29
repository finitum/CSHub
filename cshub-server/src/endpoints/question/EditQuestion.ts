import { Request, Response } from "express";

import { app } from "../../";

import { ServerError } from "../../../../cshub-shared/src/models/ServerError";
import { AddQuestion, EditQuestion } from "../../../../cshub-shared/src/api-calls/endpoints/question";
import { insertQuestions, validateNewQuestion } from "./QuestionUtils";
import { AlreadySentError } from "../utils";
import {checkTokenValidityFromRequest} from "../../auth/AuthMiddleware";

app.put(EditQuestion.getURL, (req: Request, res: Response) => {
    const editQuestion = req.body as EditQuestion;

    const authorized = checkTokenValidityFromRequest(req);
    if (!authorized){
        return res.sendStatus(401);
    }

    if (editQuestion.question === null || req.params.id === undefined) {
        res.status(400).send(new ServerError("No question!"));
        return;
    }

    try {
        validateNewQuestion(editQuestion.question, res);
        insertQuestions(
            {
                question: editQuestion.question,
                originalId: Number(req.params.id)
            },
            req,
            res
        );
    } catch (err) {
        if (!(err instanceof AlreadySentError)) {
            res.status(500).send(new ServerError("Server did oopsie"));
        }
    }
});

app.post(AddQuestion.getURL, (req: Request, res: Response) => {
    const addQuestions = req.body as AddQuestion;

    const authorized = checkTokenValidityFromRequest(req);
    if (!authorized){
        return res.sendStatus(401);
    }

    if (!addQuestions.question || !addQuestions.topicHash || isNaN(addQuestions.topicHash)) {
        res.status(400).send(new ServerError("Missing properties"));
        return;
    }

    try {
        validateNewQuestion(addQuestions.question, res);
        insertQuestions(
            {
                question: addQuestions.question
            },
            req,
            res,
            addQuestions.topicHash
        );
    } catch (err) {
        if (!(err instanceof AlreadySentError)) {
            res.status(500).send(new ServerError("Server did oopsie"));
        }
    }
});
