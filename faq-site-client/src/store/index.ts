import Vue from "vue";
import Vuex, { Store } from "vuex";
import {getStoreBuilder} from "vuex-typex";

import {IUserState} from "./user/state";
import {IUIState} from "./ui/state";

export interface IRootState {
    user: IUserState;
    ui: IUIState;
}

Vue.use(Vuex);
const store: Store<IRootState> = getStoreBuilder<IRootState>().vuexStore();

export default store;
