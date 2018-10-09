import {IUser} from "../../../../faq-site-shared/models/IUser";
import {getStoreBuilder} from "vuex-typex";
import {IRootState} from "../";

export interface IUserState {
    userModel: IUser;
    hasCheckedToken: boolean;
}

export const UserState: IUserState = {
    userModel: null,
    hasCheckedToken: false
};

export const userStoreBuilder = getStoreBuilder<IRootState>().module("user", UserState);

export const userStateGetter = userStoreBuilder.state();
