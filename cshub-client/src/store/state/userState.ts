import { IUser } from "../../../../cshub-shared/src/entities/user";
import { Module, Mutation, VuexModule } from "vuex-class-modules";
import { IStudy } from "../../../../cshub-shared/src/entities/study";
import store from "../store";

export interface IUserState {
    userModel?: IUser;
    hasCheckedToken: boolean;
}

@Module
class UserState extends VuexModule implements IUserState {
    private _userModel: IUser | undefined;
    private _hasCheckedToken = false;

    get userModel(): IUser | undefined {
        return this._userModel;
    }

    @Mutation
    public setUserModel(value: IUser) {
        this._userModel = value;
    }

    @Mutation
    public clearUserModel() {
        this._userModel = undefined;
    }

    get hasCheckedToken(): boolean {
        return this._hasCheckedToken;
    }

    @Mutation
    public setHasCheckedToken(value: boolean) {
        this._hasCheckedToken = value;
    }

    get studyAdmins(): IStudy[] {
        if (this._userModel && this._userModel.studies) {
            return this._userModel.studies;
        }
        return [];
    }

    get isAdmin(): boolean {
        if (this._userModel) {
            return this._userModel.admin;
        }
        return false;
    }

    get isLoggedIn(): boolean {
        if (this._userModel) {
            return this._userModel.id !== 0;
        }
        return false;
    }
}

export const userStateModule = new UserState({
    store,
    name: "userStateModule"
});
