import {userStoreBuilder} from "./state";

export const getRank = userStoreBuilder.read((state) => state.userModel.rank, "getRank");
