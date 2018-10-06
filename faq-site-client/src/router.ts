import Vue from "vue";
import Router from "vue-router";

import HelloWorld from "./components/HelloWorld.vue";

import LoginScreen from "./components/LoginScreen.vue";

Vue.use(Router);

export default new Router({
    mode: "history",
    base: process.env.BASE_URL,
    routes: [
        {
            path: "/login",
            name: "login",
            component: LoginScreen
        }
    ],
});
