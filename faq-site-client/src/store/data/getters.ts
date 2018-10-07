import {dataStoreBuilder} from "./state";

export const topics = dataStoreBuilder.read((state) => state.topics, "topics");
