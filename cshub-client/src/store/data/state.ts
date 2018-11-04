import {getStoreBuilder} from "vuex-typex";
import {IRootState} from "../";
import {IPost, ITopic} from "../../../../cshub-shared/models";

export interface IDataState {
    topics: ITopic[];
    hasConnection: boolean;
    searchQuery: string;
}

export const DataState: IDataState = {
    topics: null,
    hasConnection: true,
    searchQuery: ""
};

export const dataStoreBuilder = getStoreBuilder<IRootState>().module("data", DataState);

export const dataStateGetter = dataStoreBuilder.state();
