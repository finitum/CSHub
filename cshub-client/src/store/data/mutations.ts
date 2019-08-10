import {IDataState} from "./state";
import {ITopic} from "../../../../cshub-shared/src/entities/topic";

export const setTopics = (state: IDataState, payload: ITopic[]) => {
    state.topics = payload;
};

export const setConnection = (state: IDataState, payload: boolean) => {
    state.hasConnection = payload;
};

export const setSearchQuery = (state: IDataState, payload: string) => {
    state.searchQuery = payload;
};
