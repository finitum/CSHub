import {uiStateGetter, uiStoreBuilder} from "./state";
import {drawerState, editDialogState, paginationPageState} from "./getters";
import {setDrawerState, setEditDialogState, setPaginationPageState} from "./mutations";

const uiState = {
    get state() { return uiStateGetter(); },

    get drawerState() { return drawerState(); },
    get editDialogState() { return editDialogState(); },
    get paginationPageState() { return paginationPageState(); },

    setDrawerState: uiStoreBuilder.commit(setDrawerState),
    setEditDialogState: uiStoreBuilder.commit(setEditDialogState),
    setPaginationPageState: uiStoreBuilder.commit(setPaginationPageState)
};

export default uiState;
