import { Application } from "express";

import { registerCheckAnswersEndpoint } from "./CheckAnswers";
import { registerEditQuestionEndpoints } from "./EditQuestion";
import { registerGetQuestionsEndpoints } from "./GetQuestions";
import { registerQuestionSettingsEndpoint } from "./QuestionSettings";
import { registerGetQuestionEndpoints } from "./GetQuestion";

export function registerQuestionEndpoints(app: Application): void {
    registerCheckAnswersEndpoint(app);
    registerEditQuestionEndpoints(app);
    registerGetQuestionsEndpoints(app);
    registerQuestionSettingsEndpoint(app);
    registerGetQuestionEndpoints(app);
}
