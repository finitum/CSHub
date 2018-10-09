import {dataStateGetter, dataStoreBuilder} from "./state";
import {topics, quillContents} from "./getters";
import {setTopics, setQuillContents} from "./mutations";

const dataState = {
    get state() { return dataStateGetter(); },

    get topics() { return topics(); },

    get quillContents() { return quillContents(); },

    setTopics: dataStoreBuilder.commit(setTopics),

    setQuillContents: dataStoreBuilder.commit(setQuillContents)

};

export default dataState;
