import {Route} from "vue-router";
import userState from "../../../store/user/index";
import router, {Routes} from "../router";

export const adminBeforeEnter = (to: Route, from: Route, next: () => any) => {
    if (userState.isLoggedIn && userState.isAdmin) {
        router.push(Routes.LOGIN);
    } else if (!userState.isAdmin) {
        router.push(Routes.INDEX);
    } else {
        next();
    }
};
