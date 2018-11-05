import {getStoreBuilder} from "vuex-typex";
import {IRootState} from "../";

export type editDialogType = {
    on: boolean,
    hash: number
};

export interface IUIState {
    navbar: {
        open: boolean
    };
    editDialogState: editDialogType;
    paginationPageState: number;
}

export const UIState: IUIState = {
    navbar: {
        open: null
    },
    editDialogState: {
        on: false,
        hash: -1
    },
    paginationPageState: 1
};

export const uiStoreBuilder = getStoreBuilder<IRootState>().module("ui", UIState);

export const uiStateGetter = uiStoreBuilder.state();
