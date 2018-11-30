import {editDialogType, IUIState, markdownDialogType, notificationDialogType} from "./state";
import {Route} from "vue-router";

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

export const setMarkdownDialogState = (state: IUIState, payload: markdownDialogType) => {
    state.markdownDialog = payload;
};

export const setPreviousRouteState = (state: IUIState, payload: Route) => {
    state.previousRoute = payload;
};
