import {editDialogType, IUIState, markdownDialogType, notificationDialogType} from "./state";
import {Route} from "vue-router";
import {LocalStorageData} from "../localStorageData";
import {colorize} from "../../utilities/codemirror-colorize";
import CodeMirror from "codemirror";

export const setDrawerState = (state: IUIState, payload: boolean) => {
    state.navbar.open = payload;
};

export const setEditDialogState = (state: IUIState, payload: editDialogType) => {
    state.editDialogState = payload;
};

export const setCurrentEditDialogState = (state: IUIState, payload: editDialogType) => {
    state.currentEditDialogState = payload;
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

export const setDarkModeState = (state: IUIState, payload: boolean) => {
    state.darkMode = payload;
    localStorage.setItem(LocalStorageData.DARK, payload.toString());
    colorize(null, CodeMirror);
};
