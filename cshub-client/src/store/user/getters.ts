import {userStoreBuilder} from "./state";
import {IUser} from "../../../../cshub-shared/src/entities/user";
import {IStudy} from "../../../../cshub-shared/src/entities/study";

export const studyAdmins = userStoreBuilder.read<IStudy[]>((state) => {
    if (state.userModel) {
        return state.userModel.studies;
    }
    return [];
}, "studyAdmins");
export const isAdmin = userStoreBuilder.read<boolean>((state) => state.userModel !== null && state.userModel.admin, "isAdmin");
export const isLoggedIn = userStoreBuilder.read<boolean>((state) => state.userModel !== null && state.userModel.id !== 0, "isLoggedIn");
export const hasCheckedToken = userStoreBuilder.read<boolean>((state) => state.hasCheckedToken, "hasCheckedToken");
export const userModel = userStoreBuilder.read<IUser>((state) => state.userModel, "userModel");

