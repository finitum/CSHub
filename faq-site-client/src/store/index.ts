import Vue from "vue";
import Vuex, { Store } from "vuex";
import {getStoreBuilder} from "vuex-typex";

import {IUserState} from "./user/state";

export interface RootState {
    user: IUserState;
}

Vue.use(Vuex);
const store: Store<RootState> = getStoreBuilder<RootState>().vuexStore();

export default store;
