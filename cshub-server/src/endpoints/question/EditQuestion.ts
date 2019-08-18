import { Request, Response } from "express";

import { app } from "../../";

import { ServerError } from "../../../../cshub-shared/src/models/ServerError";
import { EditQuestion } from "../../../../cshub-shared/src/api-calls/endpoints/question/EditQuestion";
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
