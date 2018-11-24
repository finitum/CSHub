import {getStoreBuilder} from "vuex-typex";
import {IRootState} from "../";
import {Blot} from "parchment/dist/src/blot/abstract/blot";

export type editDialogType = {
    on: boolean,
    hash: number
};

export type markdownDialogType = {
    open: boolean,
    blots: Blot[]
};

export type notificationDialogType = {
    on: boolean,
    header: string,
    text: string
};

export interface IUIState {
    navbar: {
        open: boolean
    };
    editDialogState: editDialogType;
    paginationPageState: number;
    notificationDialog: notificationDialogType;
    markdownDialog: markdownDialogType;
}

export const UIState: IUIState = {
    navbar: {
        open: null
    },
    editDialogState: {
        on: false,
        hash: -1
    },
    paginationPageState: 1,
    notificationDialog: {
        on: false,
        header: "",
        text: ""
    },
    markdownDialog: {
        open: false,
        blots: []
    }
};

export const uiStoreBuilder = getStoreBuilder<IRootState>().module("ui", UIState);

export const uiStateGetter = uiStoreBuilder.state();
