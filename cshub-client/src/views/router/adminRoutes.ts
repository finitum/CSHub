import {RouteConfig} from "vue-router";
import {adminBeforeEnter} from "./guards/adminDashboardGuard";

import TopicCreate from "../../views/posts/TopicCreate.vue";

export enum AdminRoutes {
    TOPICCREATE = "topiccreate",
}

export const adminChildrenRoutes: RouteConfig[] = [{
    path: AdminRoutes.TOPICCREATE,
    name: "topiccreate",
    component: TopicCreate
}];
