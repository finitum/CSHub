import {userStateGetter, userStoreBuilder} from "./state";
import {hasCheckedToken, isAdmin, isLoggedIn, userModel} from "./getters";
import {changeUserModel, clearUserModel, setCheckedToken} from "./mutations";
import {IUser} from "../../../../cshub-shared/models";

const userState = {
    get state() { return userStateGetter(); },

    get isAdmin(): boolean { return isAdmin(); },
    get isLoggedIn(): boolean { return isLoggedIn(); },
    get hasCheckedToken(): boolean { return hasCheckedToken(); },
    get userModel(): IUser { return userModel(); },

    changeUserModel: userStoreBuilder.commit(changeUserModel),
    clearUserModel: userStoreBuilder.commit(clearUserModel),
    setCheckedToken: userStoreBuilder.commit(setCheckedToken)
};

export default userState;
