import {Route} from "vue-router";
import router, {Routes} from "../router";
import userState from "../../../store/user";

export const onlyIfNotLoggedIn = (to: Route, from: Route, next: () => any) => {
    if (!userState.isLoggedIn) {
        next();
    } else {
        router.push(Routes.INDEX);
    }
};
