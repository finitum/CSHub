import { Application } from "express";

import { registerGetUnverifiedPostsEndpoint } from "./GetUnverifiedPosts";
import { registerWIPPostsEndpoint } from "./WIPPosts";
import { registerTopicPostsEndpoint } from "./TopicPosts";
import { registerExamplePostsEndpoint } from "./ExamplePosts";

export function registerPostsEndpoints(app: Application): void {
    registerGetUnverifiedPostsEndpoint(app);
    registerWIPPostsEndpoint(app);
    registerTopicPostsEndpoint(app);
    registerExamplePostsEndpoint(app);
}
