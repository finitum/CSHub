import { Route } from "vue-router";
import { Module, Mutation, VuexModule } from "vuex-class-modules";
import { LocalStorageData } from "../localStorageData";
import { colorize } from "../../utilities/codemirror-colorize";
import store from "../store";
import CodeMirror from "codemirror";

import vuetify from "../../plugins/vuetify/vuetify";

export type editDialogType = {
    on: boolean;
    hash: number;
    hasJustSaved?: boolean;
};

export type notificationDialogType = {
    on: boolean;
    header: string;
    text: string;
    button?: {
        text: string;
        jsAction: () => void;
    };
};

export interface IUIState {
    navbar: {
        open: boolean;
    };
    editDialogState: editDialogType;
    currentEditDialogState: editDialogType;
    paginationPageState: number;
    notificationDialog: notificationDialogType;
    previousRoute: Route | undefined;
    darkMode: boolean;
    studyNr: number | undefined;
}

@Module
class UIState extends VuexModule implements IUIState {
    private _navbar = {
        open: false
    };

    private _editDialogState: editDialogType = {
        on: false,
        hash: -1
    };

    private _currentEditDialogState: editDialogType = {
        on: false,
        hash: -1
    };

    private _paginationPageState = 1;

    private _notificationDialog: notificationDialogType = {
        on: false,
        header: "",
        text: ""
    };

    private _previousRoute: Route | undefined = undefined;

    private _darkMode = localStorage.getItem(LocalStorageData.DARK) === "true";

    private _studyNr?: number = undefined;

    get navbar(): { open: boolean } {
        return this._navbar;
    }

    @Mutation
    public setNavbar(value: { open: boolean }) {
        this._navbar = value;
    }

    get editDialogState(): editDialogType {
        return this._editDialogState;
    }

    @Mutation
    public setEditDialogState(value: editDialogType) {
        this._editDialogState = value;
    }

    get currentEditDialogState(): editDialogType {
        return this._currentEditDialogState;
    }

    @Mutation
    public setCurrentEditDialogState(value: editDialogType) {
        this._currentEditDialogState = value;
    }

    get paginationPageState(): number {
        return this._paginationPageState;
    }

    @Mutation
    public setPaginationPageState(value: number) {
        this._paginationPageState = value;
    }

    get notificationDialog(): notificationDialogType {
        return this._notificationDialog;
    }

    @Mutation
    public setNotificationDialog(value: notificationDialogType) {
        this._notificationDialog = value;
    }

    get previousRoute(): Route | undefined {
        return this._previousRoute;
    }

    @Mutation
    public setPreviousRoute(value: Route | undefined) {
        this._previousRoute = value;
    }

    get darkMode(): boolean {
        return this._darkMode;
    }

    @Mutation
    public setDarkMode(value: boolean) {
        this._darkMode = value;
        localStorage.setItem(LocalStorageData.DARK, value.toString());
        colorize(null, CodeMirror);
    }

    get studyNr(): number | undefined {
        return this._studyNr;
    }

    @Mutation
    public setStudyNr(value: number) {
        this._studyNr = value;
    }
}

export const uiStateModule = new UIState({
    store,
    name: "uiStateModule"
});
