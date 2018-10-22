import {dataStoreBuilder} from "./state";

export const topics = dataStoreBuilder.read((state) => state.topics, "topics");

export const quillContents = dataStoreBuilder.read((state) => state.quillContents, "quillContents");
