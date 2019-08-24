import { Request, Response } from "express";

import { app } from "../../";

import { ServerError } from "../../../../cshub-shared/src/models/ServerError";
import { AddQuestion, EditQuestion } from "../../../../cshub-shared/src/api-calls/endpoints/question";
import { insertQuestions, validateNewQuestion } from "./QuestionUtils";
import { AlreadySentError } from "../utils";

app.post(EditQuestion.getURL, (req: Request, res: Response) => {
    const editQuestion = req.body as EditQuestion;

    if (editQuestion.question === null || req.params.id === undefined || !editQuestion.topicHash) {
        res.status(400).send(new ServerError("No question!"));
        return;
    }

    try {
        validateNewQuestion(editQuestion.question, res);
        insertQuestions(
            {
                editedQuestion: editQuestion.question,
                originalId: req.params.id
            },
            editQuestion.topicHash,
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
