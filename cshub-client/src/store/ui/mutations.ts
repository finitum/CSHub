import {IUIState} from "./state";

export const setDrawerState = (state: IUIState, payload: boolean) => {
    state.navbar.open = payload;
};

export const setEditDialogState = (state: IUIState, payload: boolean) => {
    state.editDialogState = payload;
};

export const setPaginationPageState = (state: IUIState, payload: number) => {
    state.paginationPageState = payload;
};
