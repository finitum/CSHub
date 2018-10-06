import {UserModel} from "../../../../faq-site-shared/models/UserModel";

import {IUserState} from "./state";

export const changeUserModel = (state: IUserState, payload: UserModel) => {
    state.userModel = payload;
};

export const clearUserModel = (state: IUserState) => {
    state.userModel = null;
};
