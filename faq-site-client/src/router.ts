import Vue from "vue";
import Router from "vue-router";

import LoginScreen from "./components/LoginScreen.vue";
import CreateAccount from "./components/CreateAccount.vue";

Vue.use(Router);

export enum Routes {
    LOGIN = "/login",
    CREATEACCOUNT = "/createaccount"
}

export default new Router({
    mode: "history",
    base: process.env.BASE_URL,
    routes: [
        {
            path: Routes.LOGIN,
            name: "login",
            component: LoginScreen
        },
        {
            path: Routes.CREATEACCOUNT,
            name: "createaccount",
            component: CreateAccount
        }
    ],
});


