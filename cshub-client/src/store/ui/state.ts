import {getStoreBuilder} from "vuex-typex";
import {IRootState} from "../";

export interface IUIState {
    navbar: {
        open: boolean
    };
    editDialogState: boolean;
    paginationPageState: number;
}

export const UIState: IUIState = {
    navbar: {
        open: null
    },
    editDialogState: false,
    paginationPageState: 1
};

export const uiStoreBuilder = getStoreBuilder<IRootState>().module("ui", UIState);

export const uiStateGetter = uiStoreBuilder.state();
