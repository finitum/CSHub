import Vue from "vue";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";
import "@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "@fortawesome/fontawesome-free/css/solid.min.css";

Vue.use(Vuetify, {
    theme: {
        primary: "#00A6D8",
        secondary: "#424242",
        accent: "#26b3dc",
        error: "#FF5252",
        info: "#2196F3",
        success: "#4CAF50",
        warning: "#FFC107"
    },
    customProperties: true,
    iconfont: "fa",
});
