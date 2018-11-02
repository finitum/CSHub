import {dataStateGetter, dataStoreBuilder} from "./state";
import {hasConnection, topics} from "./getters";
import {setConnection, setTopics} from "./mutations";

const dataState = {
    get state() { return dataStateGetter(); },

    get topics() { return topics(); },
    get hasConnection() { return hasConnection(); },

    setConnection: dataStoreBuilder.commit(setConnection),
    setTopics: dataStoreBuilder.commit(setTopics),

};

export default dataState;
