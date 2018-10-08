import {userStoreBuilder} from "./state";

export const isAdmin = userStoreBuilder.read((state) => state.userModel.admin, "isAdmin");
