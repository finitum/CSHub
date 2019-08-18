import { Request, Response } from "express";

import { app } from "../../";

import { ServerError } from "../../../../cshub-shared/src/models/ServerError";
import { AddQuestion } from "../../../../cshub-shared/src/api-calls/endpoints/question/AddQuestion";
import { insertQuestions, validateNewQuestion } from "./QuestionUtils";
import { AlreadySentError } from "../utils";

app.post(AddQuestion.getURL, (req: Request, res: Response) => {
    const addQuestions = req.body as AddQuestion;

    if (!addQuestions.question || !addQuestions.topicHash || isNaN(addQuestions.topicHash)) {
        res.status(400).send(new ServerError("Missing properties"));
        return;
    }

    try {
        validateNewQuestion(addQuestions.question, res);
        insertQuestions([addQuestions.question], addQuestions.topicHash, req, res);
    } catch (err) {
        if (!(err instanceof AlreadySentError)) {
            res.status(500).send(new ServerError("Server did oopsie"));
        }
    }
});
