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
            return getStudyNr(studies);
        })
        .then(studynr => {
            localStorage.setItem(LocalStorageData.STUDY, studynr.toString(10));
            uiState.setStudyNr(studynr);
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

function getStudies(): Promise<IStudy[]> {
    if (dataState.studies) {
        return Promise.resolve(dataState.studies);
    } else {
        return ApiWrapper.get(new Studies()).then(value => {
            const studies = value.studies;
            if (studies.length > 0) {
                return studies;
            } else {
                throw new Error("0 studies returned by server!");
            }
        });
    }
}

function getStudyNr(studies: IStudy[]): Promise<number> {
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

    return Promise.resolve(studynr);
}

function getTopTopic(studyNr: number): Promise<ITopic> {
    type topicCache = {
        version: number;
        topTopic: ITopic;
    };

    let cachedValue: topicCache | null = null;

    return localForage
        .getItem<topicCache>(CacheTypes.TOPICS)
        .then((value: topicCache) => {
            let topicCurrentVersion = -1;

            if (value !== null) {
                topicCurrentVersion = value.version;
                cachedValue = value;
            }

            return ApiWrapper.get(new Topics(topicCurrentVersion, studyNr));
        })
        .then(response => {
            const topicData: topicCache = {
                version: response.version,
                topTopic: response.topTopic
            };

            localForage.setItem(CacheTypes.TOPICS, topicData);

            return response.topTopic;
        })
        .catch(reason => {
            if (cachedValue !== null) {
                return cachedValue.topTopic;
            } else {
                throw new Error();
            }
        });
}

function parseTopTopic(topTopic: ITopic) {
    for (const child of topTopic.children) {
        child.parent = topTopic;
        parseTopTopic(child);
    }
}
