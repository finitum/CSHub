import { ITopic } from "../../../../cshub-shared/src/entities/topic";
import { Module, Mutation, VuexModule } from "vuex-class-modules";
import store from "../store";

export interface IDataState {
    topics: ITopic[];
    hasConnection: boolean;
    searchQuery: string;
}

@Module
class DataState extends VuexModule implements IDataState {
    private _topics: ITopic[] = [];

    private _hasConnection = true;

    private _searchQuery = "";

    get topics(): ITopic[] {
        return this._topics;
    }

    @Mutation
    public setTopics(value: ITopic[]) {
        this._topics = value;
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
    name: "dataStateModule"
});
