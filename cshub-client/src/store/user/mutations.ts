import {IUserState} from "./state";
import {IUser} from "../../../../cshub-shared/src/entities/user";

export const changeUserModel = (state: IUserState, payload: IUser) => {
    state.userModel = payload;
};

export const clearUserModel = (state: IUserState) => {
    state.userModel = null;
};

export const setCheckedToken = (state: IUserState) => {
    state.hasCheckedToken = true;
};
