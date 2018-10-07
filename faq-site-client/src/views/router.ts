import Vue from "vue";
import Router from "vue-router";

import LoginScreen from "./account/LoginScreen.vue";
import CreateAccount from "./account/CreateAccount.vue";
import Index from "./Index.vue";

Vue.use(Router);

export enum Routes {
    INDEX = "/",
    LOGIN = "/login",
    CREATEACCOUNT = "/createaccount",
    POST = "/post",
    TOPIC = "/topic"
}

export default new Router({
    mode: "history",
    base: process.env.BASE_URL,
    routes: [
        {
            path: Routes.INDEX,
            name: "index",
            component: Index
        },
        {
            path: Routes.LOGIN,
            name: "login",
            component: LoginScreen
        },
        {
            path: Routes.CREATEACCOUNT,
            name: "createaccount",
            component: CreateAccount
        },
        {
            path: `${Routes.POST}/:hash`,
            name: "post",
            component: Index
        }
    ],
});


