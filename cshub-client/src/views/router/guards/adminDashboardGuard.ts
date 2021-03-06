import { Route } from "vue-router";
import { userState } from "../../../store";
import router from "../router";
import { Routes } from "../../../../../cshub-shared/src/Routes";

export const adminBeforeEnter = (to: Route, from: Route, next: () => any) => {
    if (userState.isLoggedIn && userState.isStudyAdmin) {
        next();
    } else if (!userState.isStudyAdmin && userState.isLoggedIn) {
        router.push(Routes.INDEX);
    } else {
        router.push(Routes.LOGIN);
    }
};
