import "@babel/polyfill";
import Vue from "vue";
import "./plugins";

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
