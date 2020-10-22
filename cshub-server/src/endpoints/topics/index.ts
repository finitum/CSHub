import { Application } from "express";

import { registerTopicsEndpoint } from "./Topics";
import { registerEditTopicsEndpoint } from "./EditTopics";

export function registerTopicsEndpoints(app: Application): void {
    registerTopicsEndpoint(app);
    registerEditTopicsEndpoint(app);
}
