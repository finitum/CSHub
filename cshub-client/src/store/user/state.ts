import {getStoreBuilder} from "vuex-typex";
import {IRootState} from "../";
import {IUser} from "../../../../cshub-shared/src/entities/user";

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
