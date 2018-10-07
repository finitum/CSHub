import {dataStateGetter, dataStoreBuilder} from "./state";
import {topics} from "./getters";
import {setTopics} from "./mutations";

const dataState = {
    get state() { return dataStateGetter(); },

    get topics() { return topics(); },

    setTopics: dataStoreBuilder.commit(setTopics),
};

export default dataState;
