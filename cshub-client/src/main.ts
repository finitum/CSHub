import Component from "vue-class-component";
Component.registerHooks(["beforeRouteEnter", "beforeRouteLeave", "beforeRouteUpdate", "metaInfo"]);

import Meta from "vue-meta";
import "@babel/polyfill";
import Vue from "vue";
import "./plugins";

Vue.use(Meta, {
    keyName: "metaInfo",
    refreshOnceOnNavigation: true
});

import App from "./App.vue";
import router from "./views/router/router";
import store from "./store/store";
import "./registerServiceWorker";
import "./styleOverwrites.css";
import "./utilities/pipes";

import vuetify from "./plugins/vuetify/vuetify";

Vue.config.productionTip = false;

new Vue({
    router,
    store,
    vuetify,
    render: (h: any) => h(App)
}).$mount("#app");
