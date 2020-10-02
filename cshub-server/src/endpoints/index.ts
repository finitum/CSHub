import { Application } from "express";

import { registerPostEndpoints } from "./post";
import { registerPostsEndpoints } from "./posts";

import { registerPreRenderEndpoint } from "./PreRender";
import { registerSearchEndpoint } from "./Search";
import { registerEmailDomainsEndpoints } from "./emaildomains";
import { registerStudiesEndpoints } from "./study/Studies";
import { registerTopicsEndpoints } from "./topics";
import { registerUserEndpoints } from "./user";
import { registerQuestionEndpoints } from "./question";

export function registerEndpoints(app: Application): void {
    registerPostEndpoints(app);
    registerPostsEndpoints(app);
    registerUserEndpoints(app);
    registerTopicsEndpoints(app);
    registerStudiesEndpoints(app);
    registerQuestionEndpoints(app);

    registerEmailDomainsEndpoints(app);

    registerPreRenderEndpoint(app);
    registerSearchEndpoint(app);
}
