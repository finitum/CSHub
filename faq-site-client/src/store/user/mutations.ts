import {IUser} from "../../../../faq-site-shared/models/IUser";

import {IUserState} from "./state";

export const changeUserModel = (state: IUserState, payload: IUser) => {
    state.userModel = payload;
};

export const clearUserModel = (state: IUserState) => {
    state.userModel = null;
};
