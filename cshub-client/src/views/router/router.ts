import Vue from "vue";
import Router, { Route } from "vue-router";

import { VerifyToken, VerifyUserTokenCallback } from "../../../../cshub-shared/src/api-calls";
import { Routes } from "../../../../cshub-shared/src/Routes";

const LoginScreen = () => import("../user/LoginScreen.vue");
const CreateAccount = () => import("../user/CreateUserAccount.vue");
const AdminDashboard = () => import("../user/AdminDashboard.vue");
const UserDashboard = () => import("../user/UserDashboard.vue");
const UnsavedPosts = () => import("../user/UnsavedPosts.vue");
const ForgotPasswordComp = () => import("../user/ForgotPasswordComp.vue");
const WIPPosts = () => import("../user/WIPPostsView.vue");

const PostView = () => import("../posts/PostView.vue");
const PostCreate = () => import("../posts/PostCreate.vue");
const PostsSearch = () => import("../posts/PostsSearch.vue");

const Practice = () => import("../../components/practice/Practice.vue");
const Editors = () => import("../../components/practice/editors/Editors.vue");

import { userBeforeEnter } from "./guards/userDashboardGuard";
import { adminBeforeEnter } from "./guards/adminDashboardGuard";
import { onlyIfNotLoggedIn } from "./guards/onlyIfNotLoggedInGuard";

import { userState } from "../../store";
import { dataState } from "../../store";

import { AxiosError } from "axios";
import { ApiWrapper, logStringConsole } from "../../utilities";
import { uiState } from "../../store";
import { setupRequiredDataGuard } from "./guards/setupRequiredDataGuard";

Vue.use(Router);

const router = new Router({
    mode: "history",
    base: process.env.BASE_URL,
    routes: [
        {
            path: Routes.INDEX,
            name: "index",
            component: PostView
        },
        {
            path: Routes.LOGIN,
            name: "login",
            component: LoginScreen,
            beforeEnter: onlyIfNotLoggedIn
        },
        {
            path: Routes.CREATEACCOUNT,
            name: "createaccount",
            component: CreateAccount,
            beforeEnter: onlyIfNotLoggedIn
        },
        {
            path: Routes.POSTCREATE,
            name: "postcreate",
            component: PostCreate,
            beforeEnter: userBeforeEnter
        },
        {
            path: `${Routes.POST}/:hash`,
            name: "post",
            component: PostView
        },
        {
            path: `${Routes.POST}/:hash/edit`,
            name: "postEdit",
            component: PostView
        },
        {
            path: `${Routes.POST}/:hash/edits`,
            name: "postEdits",
            component: PostView
        },
        {
            path: `${Routes.POST}/:hash/save`,
            name: "postSave",
            component: PostView
        },
        {
            path: `${Routes.TOPIC}/:hash`,
            name: "topic",
            component: PostView
        },
        {
            path: `${Routes.TOPIC}/:hash/practice`,
            name: "topicpractice",
            component: Practice
        },
        {
            path: `${Routes.TOPIC}/:hash/practice/create`,
            name: "topicpracticecreate",
            component: Editors
        },
        {
            path: Routes.SEARCH,
            name: "search",
            component: PostsSearch
        },
        {
            path: Routes.WIPPOSTS,
            name: "wip",
            component: WIPPosts
        },
        {
            path: Routes.USERDASHBOARD,
            name: "user",
            component: UserDashboard,
            beforeEnter: userBeforeEnter
        },
        {
            path: Routes.UNSAVEDPOSTS,
            name: "unsavedposts",
            component: UnsavedPosts,
            beforeEnter: userBeforeEnter
        },
        {
            path: Routes.FORGOTPASSWORD,
            name: "forgotpassword",
            component: ForgotPasswordComp
        },
        {
            path: Routes.ADMINDASHBOARD,
            name: "admin",
            component: AdminDashboard,
            beforeEnter: adminBeforeEnter
        },
        {
            path: "*",
            name: "wildcard",
            component: PostView
        }
    ]
});

router.beforeEach((to: Route, from: Route, next) => {
    setupRequiredDataGuard().then(shouldWeContinue => {
        if (shouldWeContinue) {
            if (!userState.hasCheckedToken) {
                ApiWrapper.sendGetRequest(
                    new VerifyToken(),
                    (verified: VerifyUserTokenCallback) => {
                        if (!dataState.hasConnection) {
                            dataState.setConnection(true);
                        }

                        if (verified.response) {
                            logStringConsole("User is logged in", "isLoggedIn after API");
                            userState.setUserModel(verified.response);
                        } else {
                            logStringConsole("User is not logged in", "isLoggedIn after API");
                        }
                        next();
                        userState.setHasCheckedToken(true);
                    },
                    (err: AxiosError) => {
                        dataState.setConnection(false);
                        next();
                    }
                );
            } else {
                next();
            }
        } else {
            uiState.setNotificationDialog({
                on: true,
                header: "No studies / topics found :(",
                text: "Our request for studies or topics returned nothing, so we can't continue now, please report this"
            });
        }
    });
});

router.afterEach((to: Route, from: Route) => {
    uiState.setPreviousRoute(from);
});

export default router;
