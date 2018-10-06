import {UserModel} from "../../../../faq-site-shared/models/UserModel";
import {getStoreBuilder} from "vuex-typex";
import {RootState} from "../";

export interface IUserState {
    userModel: UserModel;
}

export const UserState: IUserState = {
    userModel: {
        rank: 0,
        username: null,
        blocked: 0,
        verified: 0,
        email: null
    }
};

export const userStoreBuilder = getStoreBuilder<RootState>().module("user", UserState);

export const userStateGetter = userStoreBuilder.state();
