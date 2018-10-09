import {IDataState} from "./state";
import {IPost, ITopic} from "../../../../faq-site-shared/models";
// @ts-ignore
import { Delta } from "quill-delta";

export const setTopics = (state: IDataState, payload: ITopic[]) => {
    state.topics = payload;
};

export const setQuillContents = (state: IDataState, payload: Delta) => {
    state.quillContents = payload;
};
