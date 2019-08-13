import { Request, Response } from "express";

import { app } from "../../";

import { ServerError } from "../../../../cshub-shared/src/models/ServerError";
import { AddQuestions } from "../../../../cshub-shared/src/api-calls/endpoints/question/AddQuestions";
import { insertQuestions, validateNewQuestion } from "./QuestionUtils";
import { AlreadySentError } from "../utils";

app.get(AddQuestions.getURL, (req: Request, res: Response) => {
    const addQuestions = req.body as AddQuestions;

    if (!addQuestions.questions || !addQuestions.topicHash) {
        res.status(400).send(new ServerError("Missing properties"));
        return;
    }

    try {
        addQuestions.questions.forEach(question => validateNewQuestion(question, res));
        insertQuestions(addQuestions.questions, addQuestions.topicHash, req, res);
    } catch (err) {
        if (!(err instanceof AlreadySentError)) {
            res.status(500).send(new ServerError("Server did oopsie"));
        }
    }
});
