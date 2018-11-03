import Vue from "vue";
import Router, {Route} from "vue-router";

import {VerifyUserToken, VerifyUserTokenCallback, VerifyUserTokenResponseTypes} from "../../../../cshub-shared/api-calls/account";

import LoginScreen from "../user/LoginScreen.vue";
import CreateAccount from "../user/CreateAccount.vue";
import AdminDashboard from "../user/AdminDashboard.vue";
import UserDashboard from "../user/UserDashboard.vue";

import PostView from "../posts/PostView.vue";
import PostCreate from "../posts/PostCreate.vue";

import {userBeforeEnter} from "./guards/userDashboardGuard";
import {adminBeforeEnter} from "./guards/adminDashboardGuard";
import {onlyIfNotLoggedIn} from "./guards/onlyIfNotLoggedInGuard";

import {adminChildrenRoutes} from "./adminRoutes";
import userState from "../../store/user";
import {ApiWrapper, logStringConsole} from "../../utilities";

import Quill from "../../components/quill/Quill.vue";
import {AxiosError} from "axios";
import dataState from "../../store/data";

Vue.use(Router);

export class Routes {
    static readonly INDEX: string = "/";
    static readonly LOGIN = "/login";
    static readonly EDITOR = "/editor";
    static readonly CREATEACCOUNT = "/createaccount";
    static readonly POST = "/post";
    static readonly POSTCREATE = "/post/create";
    static readonly TOPIC = "/topic";
    static readonly USERDASHBOARD = "/user";
    static readonly ADMINDASHBOARD = "/admin";
}

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
            path: Routes.EDITOR, // TODO: Same as import
            name: "editor",
            component: Quill
        },
        {
            path: `${Routes.TOPIC}/:hash`,
            name: "topic",
            component: PostView
        },
        {
            path: Routes.USERDASHBOARD,
            name: "user",
            component: UserDashboard,
            beforeEnter: userBeforeEnter
        },
        {
            path: `${Routes.USERDASHBOARD}/:hash`,
            name: "post",
            component: PostView
        },
        {
            path: `${Routes.USERDASHBOARD}/:hash/edit`,
            name: "postEdit",
            component: PostView
        },
        {
            path: Routes.ADMINDASHBOARD,
            name: "admin",
            component: AdminDashboard,
            beforeEnter: adminBeforeEnter,
            children: adminChildrenRoutes
        }
    ],
});

router.beforeEach((to: Route, from: Route, next) => {
    next();

    if (!userState.hasCheckedToken) {
        ApiWrapper.sendGetRequest(new VerifyUserToken(), (verified: VerifyUserTokenCallback) => {

            if (!dataState.hasConnection) {
                dataState.setConnection(true);
            }

            if (verified.response === VerifyUserTokenResponseTypes.VALID) {
                logStringConsole("User is logged in", "isLoggedIn after API");
                userState.changeUserModel(verified.userModel);
            } else {
                logStringConsole("User is not logged in", "isLoggedIn after API");
            }
            userState.setCheckedToken();

        }, (err: AxiosError) => {
            dataState.setConnection(false);
        });
    }

});

export default router;
