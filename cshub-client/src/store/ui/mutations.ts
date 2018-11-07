import {editDialogType, IUIState, notificationDialogType} from "./state";

export const setDrawerState = (state: IUIState, payload: boolean) => {
    state.navbar.open = payload;
};

export const setEditDialogState = (state: IUIState, payload: editDialogType) => {
    state.editDialogState = payload;
};

export const setPaginationPageState = (state: IUIState, payload: number) => {
    state.paginationPageState = payload;
};

export const setNotificationDialogState = (state: IUIState, payload: notificationDialogType) => {
    state.notificationDialog = payload;
};

