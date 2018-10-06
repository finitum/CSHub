import "@babel/polyfill";
import Vue from "vue";
import "./plugins/vuetify/vuetify";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./registerServiceWorker";

import VeeValidate from "vee-validate";

Vue.config.productionTip = false;

Vue.use(VeeValidate, { inject: false, delay: 1 });

new Vue({
    router,
    store,
    render: (h: any) => h(App),
}).$mount("#app");
