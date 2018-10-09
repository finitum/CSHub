import {userStateGetter, userStoreBuilder} from "./state";
import {hasCheckedToken, isAdmin, isLoggedIn} from "./getters";
import {changeUserModel, clearUserModel, setCheckedToken} from "./mutations";

const userState = {
    get state() { return userStateGetter(); },

    get isAdmin(): boolean { return isAdmin(); },
    get isLoggedIn(): boolean { return isLoggedIn(); },
    get hasCheckedToken(): boolean { return hasCheckedToken(); },

    changeUserModel: userStoreBuilder.commit(changeUserModel),
    clearUserModel: userStoreBuilder.commit(clearUserModel),
    setCheckedToken: userStoreBuilder.commit(setCheckedToken)
};

export default userState;
