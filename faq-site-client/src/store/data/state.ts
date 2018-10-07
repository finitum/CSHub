import {getStoreBuilder} from "vuex-typex";
import {RootState} from "../";
import {IPost, ITopic} from "../../../../faq-site-shared/models";

export interface IDataState {
    topics: ITopic[];
}

export const DataState: IDataState = {
    topics: null
};

export const dataStoreBuilder = getStoreBuilder<RootState>().module("data", DataState);

export const dataStateGetter = dataStoreBuilder.state();
