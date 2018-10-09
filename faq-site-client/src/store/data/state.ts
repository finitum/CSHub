import {getStoreBuilder} from "vuex-typex";
import {IRootState} from "../";
import {IPost, ITopic} from "../../../../faq-site-shared/models";

export interface IDataState {
    topics: ITopic[];
}

export const DataState: IDataState = {
    topics: null
};

export const dataStoreBuilder = getStoreBuilder<IRootState>().module("data", DataState);

export const dataStateGetter = dataStoreBuilder.state();
