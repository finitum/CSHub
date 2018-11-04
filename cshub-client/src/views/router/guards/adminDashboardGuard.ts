import {Route} from "vue-router";
import userState from "../../../store/user/index";
import router, {Routes} from "../router";
import {logStringConsole} from "../../../utilities";

export const adminBeforeEnter = (to: Route, from: Route, next: () => any) => {
    if (userState.isLoggedIn && userState.isAdmin) {
        next();
    } else if (!userState.isAdmin && userState.isLoggedIn) {
        router.push(Routes.INDEX);
    } else {
        router.push(Routes.LOGIN);
    }
};
