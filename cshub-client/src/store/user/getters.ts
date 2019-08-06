import {userStoreBuilder} from "./state";
import {IUser} from "../../../../cshub-shared/src/entities/user";

export const isAdmin = userStoreBuilder.read<boolean>((state) => state.userModel !== null && state.userModel.admin, "isAdmin");
export const isLoggedIn = userStoreBuilder.read<boolean>((state) => state.userModel !== null && state.userModel.id !== 0, "isLoggedIn");
export const hasCheckedToken = userStoreBuilder.read<boolean>((state) => state.hasCheckedToken, "hasCheckedToken");
export const userModel = userStoreBuilder.read<IUser>((state) => state.userModel, "userModel");

