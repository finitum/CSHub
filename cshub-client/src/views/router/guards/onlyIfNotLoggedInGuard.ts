import {Route} from "vue-router";
import router from "../router";
import userState from "../../../store/user";
import {Routes} from "../../../../../cshub-shared/src/Routes";

export const onlyIfNotLoggedIn = (to: Route, from: Route, next: () => any) => {
    if (!userState.isLoggedIn) {
        next();
    } else {
        router.push(Routes.INDEX);
    }
};
