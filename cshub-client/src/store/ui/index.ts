import {uiStateGetter, uiStoreBuilder} from "./state";
import {drawerState, editDialogState, markdownDialog, notificationDialog, paginationPageState} from "./getters";
import {
    setDrawerState,
    setEditDialogState,
    setMarkdownDialogState,
    setNotificationDialogState,
    setPaginationPageState
} from "./mutations";

const uiState = {
    get state() { return uiStateGetter(); },

    get drawerState() { return drawerState(); },
    get editDialogState() { return editDialogState(); },
    get paginationPageState() { return paginationPageState(); },
    get notificationDialogState() { return notificationDialog(); },
    get mardownDialogState() { return markdownDialog(); },

    setDrawerState: uiStoreBuilder.commit(setDrawerState, "setDrawerState"),
    setEditDialogState: uiStoreBuilder.commit(setEditDialogState, "setEditDialogState"),
    setPaginationPageState: uiStoreBuilder.commit(setPaginationPageState, "setPaginationPageState"),
    setNotificationDialogState: uiStoreBuilder.commit(setNotificationDialogState, "setNotificationDialogState"),
    setMarkdownDialogState: uiStoreBuilder.commit(setMarkdownDialogState, "setMarkdownDialogState")
};

export default uiState;
