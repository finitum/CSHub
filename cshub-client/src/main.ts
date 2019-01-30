import Component from "vue-class-component";
import Meta from "vue-meta";

Component.registerHooks([
    "beforeRouteEnter",
    "beforeRouteLeave",
    "beforeRouteUpdate",
    "metaInfo"
]);

import "@babel/polyfill";
import Vue from "vue";
import "./plugins";

Vue.use(Meta);

import App from "./App.vue";
import router from "./views/router/router";
import store from "./store";
import "./registerServiceWorker";
import "./styleOverwrites.css";
import "./utilities/pipes";

Vue.config.productionTip = false;

new Vue({
    router,
    store,
    render: (h: any) => h(App),
}).$mount("#app");
