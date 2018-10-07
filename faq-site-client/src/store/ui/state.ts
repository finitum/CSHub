import {getStoreBuilder} from "vuex-typex";
import {RootState} from "../";

export interface IUIState {
    navbar: {
        open: boolean
    };
    post: {
        height: number;
    };
}

export const UIState: IUIState = {
    navbar: {
        open: null
    },
    post: {
        height: 220
    }
};

export const uiStoreBuilder = getStoreBuilder<RootState>().module("ui", UIState);

export const uiStateGetter = uiStoreBuilder.state();
