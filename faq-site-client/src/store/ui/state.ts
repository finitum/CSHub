import {getStoreBuilder} from "vuex-typex";
import {RootState} from "../";

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

export const uiStoreBuilder = getStoreBuilder<RootState>().module("ui", UIState);

export const uiStateGetter = uiStoreBuilder.state();
