import {uiStateGetter, uiStoreBuilder} from "./state";
import {drawerState, postHeight} from "./getters";
import {setDrawerState, setPostHeight} from "./mutations";

const uiState = {
    get state() { return uiStateGetter(); },

    get drawerState() { return drawerState(); },
    get postHeight() { return postHeight(); },

    setDrawerState: uiStoreBuilder.commit(setDrawerState),
    setPostHeight: uiStoreBuilder.commit(setPostHeight)
};

export default uiState;
