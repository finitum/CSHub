import {dataStateGetter, dataStoreBuilder} from "./state";
import {currentPost, topics} from "./getters";
import {setCurrentPost, setTopics} from "./mutations";

const dataState = {
    get state() { return dataStateGetter(); },

    get topics() { return topics(); },
    get currentpost() { return currentPost(); },

    setTopics: dataStoreBuilder.commit(setTopics),
    setCurrentPost: dataStoreBuilder.commit(setCurrentPost),
};

export default dataState;
