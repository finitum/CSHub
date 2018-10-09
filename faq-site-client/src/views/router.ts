import Vue from "vue";
import Router from "vue-router";

import LoginScreen from "./account/LoginScreen.vue";
import CreateAccount from "./account/CreateAccount.vue";
import PostView from "./PostView.vue";

import Quill from "../components/Quill/Quill.vue"; // TODO: Remove if done with testing

Vue.use(Router);

export enum Routes {
    INDEX = "/",
    LOGIN = "/login",
    CREATEACCOUNT = "/createaccount",
    EDITOR = "/editor",
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
            component: PostView
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
            path: Routes.EDITOR, // TODO: Same as import
            name: "editor",
            component: Quill
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
        }
    ],
});


