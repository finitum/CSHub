import { dataState, uiState } from "../../../store";
import { ApiWrapper, logObjectConsole, logStringConsole } from "../../../utilities";
import { Studies } from "../../../../../cshub-shared/src/api-calls/endpoints/study/Studies";
import { Topics } from "../../../../../cshub-shared/src/api-calls/endpoints/topics";
import { IStudy } from "../../../../../cshub-shared/src/entities/study";
import { LocalStorageData } from "../../../store/localStorageData";
import * as localForage from "localforage";
import { CacheTypes } from "../../../utilities/cache-types";
import { ITopic } from "../../../../../cshub-shared/src/entities/topic";

export const setupRequiredDataGuard = (): Promise<boolean> => {
    if (dataState.studies && uiState.studyNr && dataState.topTopic) {
        return Promise.resolve(true);
    }

    return getStudies()
        .then(studies => {
            dataState.setStudies(studies);
            return getAndSetStudyNr(studies);
        })
        .then(studynr => {
            return getTopTopic(studynr);
        })
        .then(topTopic => {
            parseTopTopic(topTopic);
            return topTopic;
        })
        .then(topTopic => {
            dataState.setTopics(topTopic);
            return true;
        })
        .catch(err => {
            logStringConsole("Error!", "SetupRequiredDataGuard");
            logObjectConsole(err);
            return false;
        });
};

export async function getStudies(forceUpdate = false): Promise<IStudy[]> {
    if (dataState.studies && !forceUpdate) {
        return Promise.resolve(dataState.studies);
    }

    type studyCache = {
        version: number;
        studies: IStudy[];
    };

    const studyCache = await localForage.getItem<studyCache>(CacheTypes.STUDIES);
    let studyCurrentVersion = -1;

    if (studyCache !== null) {
        studyCurrentVersion = studyCache.version;
    }

    try {
        const studies = await ApiWrapper.get(new Studies(studyCurrentVersion));

        if (studies !== null) {
            if (studies.studies.length === 0) {
                throw new Error("0 studies returned by server!");
            }

            const studyData: studyCache = {
                version: studies.version,
                studies: studies.studies
            };

            localForage.setItem(CacheTypes.STUDIES, studyData);

            return studyData.studies;
        } else {
            return studyCache.studies;
        }
    } catch (err) {
        if (studyCache !== null) {
            return studyCache.studies;
        } else {
            throw new Error();
        }
    }
}

export function getAndSetStudyNr(studies: IStudy[]): Promise<number> {
    const studyLocalStorage = localStorage.getItem(LocalStorageData.STUDY);

    let studynr: number;
    if (!studyLocalStorage || isNaN(Number(studyLocalStorage))) {
        studynr = studies[0].id;
    } else {
        if (studies.findIndex(currStudy => currStudy.id === +studyLocalStorage) === -1) {
            studynr = studies[0].id;
        } else {
            studynr = +studyLocalStorage;
        }
    }

    localStorage.setItem(LocalStorageData.STUDY, studynr.toString(10));
    uiState.setStudyNr(studynr);

    return Promise.resolve(studynr);
}

export async function getTopTopic(studyNr: number, forceUpdate = false): Promise<ITopic> {
    if (dataState.topTopic && !forceUpdate) {
        return Promise.resolve(dataState.topTopic);
    }

    type topicCache = {
        version: number;
        topTopic: ITopic;
    };

    const topicCache = await localForage.getItem<topicCache>(CacheTypes.TOPICS + studyNr);
    let topicCurrentVersion = -1;

    if (topicCache !== null) {
        topicCurrentVersion = topicCache.version;
    }

    try {
        const topics = await ApiWrapper.get(new Topics(topicCurrentVersion, studyNr));

        if (topics !== null) {
            const topicData: topicCache = {
                version: topics.version,
                topTopic: topics.topTopic
            };

            localForage.setItem(CacheTypes.TOPICS + studyNr, topicData);

            return topics.topTopic;
        } else {
            return topicCache.topTopic;
        }
    } catch (err) {
        if (topicCache !== null) {
            return topicCache.topTopic;
        } else {
            throw new Error();
        }
    }
}

export function parseTopTopic(topTopic: ITopic) {
    for (const child of topTopic.children) {
        child.parent = topTopic;
        parseTopTopic(child);
    }
}
