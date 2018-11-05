import {IApiRequest} from "../../models";
import {NonAuthRequests} from "../NonAuthRequests";
import {IPost} from "../../models";

export enum PostVersionTypes {
    UPDATEDPOST,
    RETRIEVEDCONTENT,
    POSTDELETED,
    NOCHANGE
}

export class GetPostContentCallBack {

    constructor(
        public postVersionType: PostVersionTypes,
        public content?: {
            html: string,
            approved: boolean
        },
        public postUpdated?: IPost
    ) {}
}

export class GetPostContent implements IApiRequest {

    public static getURL: string = NonAuthRequests.POSTCONTENT;
    public URL: string = GetPostContent.getURL;

    constructor(public postHash: number, public getHTMLOnNoUpdate: boolean, public postVersion: number) {}

}
