import Vuetify from "vuetify/lib";
import "@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "@fortawesome/fontawesome-free/css/solid.min.css";
import "@fortawesome/fontawesome-free/css/brands.min.css";
import "@fortawesome/fontawesome-free/css/regular.min.css";
import Vue from "vue";
import { LocalStorageData } from "../../store/localStorageData";

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        themes: {
            light: {
                primary: "#00A6D8",
                secondary: "#424242",
                accent: "#26b3dc",
                error: "#FF5252",
                info: "#2196F3",
                success: "#4CAF50",
                warning: "#FFC107"
            }
        },
        dark: localStorage.getItem(LocalStorageData.DARK) === "true"
    },
    customProperties: true,
    icons: {
        iconfont: "fa"
    }
});
