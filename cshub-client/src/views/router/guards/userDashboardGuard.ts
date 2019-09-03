import { Route } from "vue-router";
import { userState } from "../../../store";
import router from "../router";
import { Routes } from "../../../../../cshub-shared/src/Routes";

export const userBeforeEnter = (to: Route, from: Route, next: () => any) => {
    if (userState.isLoggedIn) {
        next();
    } else {
        router.push(Routes.LOGIN);
    }
};
