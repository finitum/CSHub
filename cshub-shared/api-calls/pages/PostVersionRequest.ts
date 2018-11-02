import {IApiRequest} from "../../models";
import {NonAuthRequests} from "../NonAuthRequests";
import {IPost} from "../../models";

export enum PostVersionTypes {
    UPDATEDPOST,
    RETRIEVEDCONTENT,
    POSTDELETED,
    NOCHANGE
}

export class PostVersionCallBack {

    constructor(
        public postVersionType: PostVersionTypes,
        public htmlContent?: string,
        public postUpdated?: IPost
    ) {}
}

export class PostVersionRequest implements IApiRequest {

    public static getURL: string = NonAuthRequests.POSTCONTENT;
    public URL: string = PostVersionRequest.getURL;

    constructor(public postHash: number, public getHTMLOnNoUpdate: boolean, public postVersion: number) {}

}
