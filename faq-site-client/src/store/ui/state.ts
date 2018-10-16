import {getStoreBuilder} from "vuex-typex";
import {IRootState} from "../";

export interface IUIState {
    navbar: {
        open: boolean
    };
}

export const UIState: IUIState = {
    navbar: {
        open: null
    }
};

export const uiStoreBuilder = getStoreBuilder<IRootState>().module("ui", UIState);

export const uiStateGetter = uiStoreBuilder.state();
