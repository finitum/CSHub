import {uiStateGetter, uiStoreBuilder} from "./state";
import {drawerState} from "./getters";
import {setDrawerState} from "./mutations";

const uiState = {
    get state() { return uiStateGetter(); },

    get drawerState() { return drawerState(); },

    setDrawerState: uiStoreBuilder.commit(setDrawerState),
};

export default uiState;
