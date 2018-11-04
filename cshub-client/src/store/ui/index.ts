import {uiStateGetter, uiStoreBuilder} from "./state";
import {drawerState, editDialogState} from "./getters";
import {setDrawerState, setEditDialogState} from "./mutations";

const uiState = {
    get state() { return uiStateGetter(); },

    get drawerState() { return drawerState(); },
    get editDialogState() { return editDialogState(); },

    setDrawerState: uiStoreBuilder.commit(setDrawerState),
    setEditDialogState: uiStoreBuilder.commit(setEditDialogState)
};

export default uiState;
