import "@babel/polyfill";
import Vue from "vue";
import "./plugins";
import App from "./App.vue";
import router from "./views/router";
import store from "./store";
import "./registerServiceWorker";
import "./styleOverwrites.css";

Vue.config.productionTip = false;

new Vue({
    router,
    store,
    render: (h: any) => h(App),
}).$mount("#app");
