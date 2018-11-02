import {dataStoreBuilder} from "./state";

export const topics = dataStoreBuilder.read((state) => state.topics, "topics");

export const hasConnection = dataStoreBuilder.read((state) => state.hasConnection, "hasConnection");
