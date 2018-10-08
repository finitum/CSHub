import {IDataState} from "./state";
import {ITopic} from "../../../../faq-site-shared/models";

export const setTopics = (state: IDataState, payload: ITopic[]) => {
    state.topics = payload;
};
