import { ITopic } from "../../../../cshub-shared/src/entities/topic";
import { Module, Mutation, VuexModule } from "vuex-class-modules";
import store from "../store";
import { IStudy } from "../../../../cshub-shared/src/entities/study";

export interface IDataState {
    topTopic: ITopic | null;
    studies: IStudy[] | null;
    hasConnection: boolean;
    searchQuery: string;
}

@Module
class DataState extends VuexModule implements IDataState {
    private _topics: ITopic | null = null;

    private _studies: IStudy[] | null = null;

    private _hasConnection = true;

    private _searchQuery = "";

    get topTopic(): ITopic | null {
        return this._topics;
    }

    @Mutation
    public setTopics(value: ITopic) {
        this._topics = value;
    }

    get studies(): IStudy[] | null {
        return this._studies;
    }

    @Mutation
    public setStudies(value: IStudy[]) {
        this._studies = value;
    }

    get hasConnection(): boolean {
        return this._hasConnection;
    }

    @Mutation
    public setConnection(value: boolean) {
        this._hasConnection = value;
    }

    get searchQuery(): string {
        return this._searchQuery;
    }

    @Mutation
    public setSearchQuery(value: string) {
        this._searchQuery = value;
    }
}

export const dataStateModule = new DataState({
    store,
    name: "dataStateModule",
});
