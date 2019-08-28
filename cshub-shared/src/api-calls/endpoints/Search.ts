import { IApiRequest } from "../../models";
import { Requests } from "../Requests";

export class GetSearchPostsCallback {
    constructor(public hashes: number[]) {}
}

export class Search implements IApiRequest<GetSearchPostsCallback> {
    public static getURL: string = Requests.SEARCH;
    public URL: string = Search.getURL;

    constructor(query: string, studyNr: number) {
        this.URL += `?query=${query}&studyNr=${studyNr}`;
    }
}
