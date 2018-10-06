import {IUser} from "../../../../faq-site-shared/models/IUser";
import {getStoreBuilder} from "vuex-typex";
import {RootState} from "../";

export interface IUserState {
    userModel: IUser;
}

export const UserState: IUserState = {
    userModel: {
        id: 0,
        rank: 0,
        blocked: 0,
        verified: 0,
        email: null,
        firstname: "",
        lastname: "",
        avatar: ""
    }
};

export const userStoreBuilder = getStoreBuilder<RootState>().module("user", UserState);

export const userStateGetter = userStoreBuilder.state();
