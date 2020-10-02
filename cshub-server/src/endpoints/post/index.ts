import { Application } from "express";

import { registerEditContentEndpoint } from "./EditContent";
import { registerEditPostEndpoint } from "./EditPost";
import { registerForceEditPostEndpoint } from "./ForceEditPost";
import { registerPostContentEndpoint } from "./PostContent";
import { registerPostDataEndpoint } from "./PostData";
import { registerPostSettingsEndpoint } from "./PostSettings";
import { registerSquashEditsEndpoint } from "./SquashEdits";
import { registerSubmitPostEndpoint } from "./SubmitPost";

export function registerPostEndpoints(app: Application): void {
    registerEditContentEndpoint(app);
    registerEditPostEndpoint(app);
    registerForceEditPostEndpoint(app);
    registerPostContentEndpoint(app);
    registerPostDataEndpoint(app);
    registerPostSettingsEndpoint(app);
    registerSquashEditsEndpoint(app);
    registerSubmitPostEndpoint(app);
}
