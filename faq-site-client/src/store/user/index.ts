import {userStateGetter, userStoreBuilder} from "./state";
import {isAdmin} from "./getters";
import {changeUserModel, clearUserModel} from "./mutations";

const userState = {
    get state() { return userStateGetter(); },

    get isAdmin() { return isAdmin(); },

    changeUserModel: userStoreBuilder.commit(changeUserModel),
    clearUserModel: userStoreBuilder.commit(clearUserModel),
};

export default userState;
