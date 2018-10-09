import Vue from "vue";
import Router, {Route} from "vue-router";

import {VerifyTokenRequest, VerifyTokenRequestCallBack, VerifyTokenResponses} from "../../../../faq-site-shared/api-calls/user";

import LoginScreen from "../account/LoginScreen.vue";
import CreateAccount from "../account/CreateAccount.vue";
import AdminDashboard from "../account/AdminDashboard.vue";
import UserDashboard from "../account/UserDashboard.vue";

import PostView from "../PostView.vue";

import {userBeforeEnter} from "./guards/userDashboardGuard";
import {adminBeforeEnter} from "./guards/adminDashboardGuard";
import {onlyIfNotLoggedIn} from "./guards/onlyIfNotLoggedInGuard";

import {adminChildrenRoutes} from "./adminRoutes";
import userState from "../../store/user";
import {ApiWrapper, LogStringConsole} from "../../utilities";

Vue.use(Router);

export enum Routes {
    INDEX = "/",
    LOGIN = "/login",
    CREATEACCOUNT = "/createaccount",
    POST = "/post",
    TOPIC = "/topic",
    USERDASHBOARD = "/user",
    ADMINDASHBOARD = "/admin"
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
            path: `${Routes.POST}/:hash`,
            name: "post",
            component: PostView
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
            path: Routes.ADMINDASHBOARD,
            name: "admin",
            component: AdminDashboard,
            beforeEnter: adminBeforeEnter,
            children: adminChildrenRoutes
        }
    ],
});

router.beforeEach((to: Route, from: Route, next) => {
    if (!userState.hasCheckedToken) {
        ApiWrapper.sendGetRequest(new VerifyTokenRequest(), (verified: VerifyTokenRequestCallBack) => {

            if (verified.response === VerifyTokenResponses.VALID) {
                LogStringConsole("User is logged in", "isLoggedIn after API");
                userState.changeUserModel(verified.userModel);
            } else {
                LogStringConsole("User is not logged in", "isLoggedIn after API");
                userState.setCheckedToken();
            }
            next();
        });
    } else {
        next();
    }

});

export default router;
