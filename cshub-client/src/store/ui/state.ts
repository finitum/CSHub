import {getStoreBuilder} from "vuex-typex";
import {IRootState} from "../";

export interface IUIState {
    navbar: {
        open: boolean
    };
    editDialogState: boolean;
}

export const UIState: IUIState = {
    navbar: {
        open: null
    },
    editDialogState: false
};

export const uiStoreBuilder = getStoreBuilder<IRootState>().module("ui", UIState);

export const uiStateGetter = uiStoreBuilder.state();
