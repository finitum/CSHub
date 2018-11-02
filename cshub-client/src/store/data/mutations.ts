import {IDataState} from "./state";
import {IPost, ITopic} from "../../../../cshub-shared/models";
// @ts-ignore
import { Delta } from "quill-delta";

export const setTopics = (state: IDataState, payload: ITopic[]) => {
    state.topics = payload;
};

export const setConnection = (state: IDataState, payload: boolean) => {
    state.hasConnection = payload;
};
