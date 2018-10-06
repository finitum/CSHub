import {userStateGetter, userStoreBuilder} from "./state";
import {getRank} from "./getters";
import {changeUserModel, clearUserModel} from "./mutations";

const userState = {
    get state() { return userStateGetter(); },

    get rank() { return getRank(); },

    changeUserModel: userStoreBuilder.commit(changeUserModel),
    clearUserModel: userStoreBuilder.commit(clearUserModel),
};

export default userState;
