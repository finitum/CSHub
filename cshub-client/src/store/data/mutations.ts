import {IDataState} from "./state";
import {IPost, ITopic} from "../../../../cshub-shared/src/models";
// @ts-ignore
import { Delta } from "quill-delta";

export const setTopics = (state: IDataState, payload: ITopic[]) => {
    state.topics = payload;
};

export const setConnection = (state: IDataState, payload: boolean) => {
    state.hasConnection = payload;
};

export const setSearchQuery = (state: IDataState, payload: string) => {
    state.searchQuery = payload;
};
