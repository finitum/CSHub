import {getStoreBuilder} from "vuex-typex";
import {IRootState} from "../";
import {IPost, ITopic} from "../../../../cshub-shared/models";

export interface IDataState {
    topics: ITopic[];
    quillContents: object;
}

export const DataState: IDataState = {
    topics: null,
    quillContents: null
};

export const dataStoreBuilder = getStoreBuilder<IRootState>().module("data", DataState);

export const dataStateGetter = dataStoreBuilder.state();
