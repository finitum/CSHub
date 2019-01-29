import {uiStateGetter, uiStoreBuilder} from "./state";
import {
    currentEditDialogState,
    drawerState,
    editDialogState,
    markdownDialog,
    notificationDialog,
    paginationPageState,
    previousRoute
} from "./getters";
import {
    setCurrentEditDialogState,
    setDrawerState,
    setEditDialogState,
    setMarkdownDialogState,
    setNotificationDialogState,
    setPaginationPageState, setPreviousRouteState
} from "./mutations";

const uiState = {
    get state() { return uiStateGetter(); },

    get drawerState() { return drawerState(); },
    get editDialogState() { return editDialogState(); },
    get currentEditDialogState() { return currentEditDialogState(); },
    get paginationPageState() { return paginationPageState(); },
    get notificationDialogState() { return notificationDialog(); },
    get mardownDialogState() { return markdownDialog(); },
    get previousRoute() { return previousRoute(); },

    setDrawerState: uiStoreBuilder.commit(setDrawerState, "setDrawerState"),
    setEditDialogState: uiStoreBuilder.commit(setEditDialogState, "setEditDialogState"),
    setCurrentEditDialogState: uiStoreBuilder.commit(setCurrentEditDialogState, "setCurrentEditDialogState"),
    setPaginationPageState: uiStoreBuilder.commit(setPaginationPageState, "setPaginationPageState"),
    setNotificationDialogState: uiStoreBuilder.commit(setNotificationDialogState, "setNotificationDialogState"),
    setMarkdownDialogState: uiStoreBuilder.commit(setMarkdownDialogState, "setMarkdownDialogState"),
    setPreviousRouteState: uiStoreBuilder.commit(setPreviousRouteState, "setPreviousRouteState")
};

export default uiState;
