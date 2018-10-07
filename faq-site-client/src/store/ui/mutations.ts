import {IUIState} from "./state";

export const setDrawerState = (state: IUIState, payload: boolean) => {
    state.navbar.open = payload;
};

export const setPostHeight = (state: IUIState, payload: number) => {
    state.post.height = payload;
};
