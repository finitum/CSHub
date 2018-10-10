import {Route} from "vue-router";
import userState from "../../../store/user/index";
import router, {Routes} from "../router";
import {LogStringConsole} from "../../../utilities";

export const adminBeforeEnter = (to: Route, from: Route, next: () => any) => {
    if (!userState.isLoggedIn) {
        LogStringConsole("User route to login page as not logged in", "Admin dashboard guard");
        router.push(Routes.LOGIN);
    } else if (!userState.isAdmin) {
        LogStringConsole("User route to index page as not admin", "Admin dashboard guard");
        router.push(Routes.INDEX);
    } else {
        LogStringConsole("User route to admin page", "Admin dashboard guard");
        next();
    }
};
