import Vue from "vue";
import Vuex from "vuex";

import { IDataState } from "./state/dataState";
import { IUserState } from "./state/userState";
import { IUIState } from "./state/uiState";
import { IPracticeState } from "./state/practiceState";

export interface IRootState {
    user: IUserState;
    ui: IUIState;
    data: IDataState;
    practice: IPracticeState;
}

Vue.use(Vuex);

export default new Vuex.Store<IRootState>({});
