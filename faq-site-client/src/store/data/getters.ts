import {dataStoreBuilder} from "./state";

export const topics = dataStoreBuilder.read((state) => state.topics, "topics");

export const currentPost = dataStoreBuilder.read((state) => state.post, "currentPost");
