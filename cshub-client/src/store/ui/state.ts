import {getStoreBuilder} from "vuex-typex";
import {IRootState} from "../";
import {Blot} from "parchment/dist/src/blot/abstract/blot";
import {Route} from "vue-router";
import {LocalStorageData} from "../localStorageData";

export type editDialogType = {
    on: boolean,
    hash: number,
    hasJustSaved?: boolean
};

export type markdownDialogType = {
    open: boolean,
    blots: Blot[]
};

export type notificationDialogType = {
    on: boolean,
    header: string,
    text: string,
    button?: {
        text: string,
        jsAction: () => void
    }
};

export interface IUIState {
    navbar: {
        open: boolean
    };
    editDialogState: editDialogType;
    currentEditDialogState: editDialogType;
    paginationPageState: number;
    notificationDialog: notificationDialogType;
    previousRoute: Route;
    darkMode: boolean;
}

export const UIState: IUIState = {
    navbar: {
        open: null
    },
    editDialogState: {
        on: false,
        hash: -1
    },
    currentEditDialogState: {
        on: false,
        hash: -1
    },
    paginationPageState: 1,
    notificationDialog: {
        on: false,
        header: "",
        text: ""
    },
    previousRoute: null,
    darkMode: localStorage.getItem(LocalStorageData.DARK) === "true"
};

export const uiStoreBuilder = getStoreBuilder<IRootState>().module("ui", UIState);

export const uiStateGetter = uiStoreBuilder.state();
