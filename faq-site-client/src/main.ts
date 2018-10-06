import "@babel/polyfill";
import Vue from "vue";
import "./plugins/vuetify/vuetify";
import "./plugins/validation";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./registerServiceWorker";

Vue.config.productionTip = false;

new Vue({
    router,
    store,
    render: (h: any) => h(App),
}).$mount("#app");
