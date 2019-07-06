import {IApiRequest, IPost} from "../../../models";
import {Requests} from "../../Requests";

export enum PostVersionTypes {
    UPDATEDPOST,
    RETRIEVEDCONTENT,
    POSTDELETED
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

export class PostContent implements IApiRequest {

    public static getURL: string = Requests.POSTCONTENT;
    public URL: string = PostContent.getURL;

    public headers: any = {};
    public static readonly postVersionHeader = "X-Post-Version";

    constructor(postHash: number, postVersion: number) {
        this.URL = this.URL.replace(/:hash/, postHash.toString());
        this.headers[PostContent.postVersionHeader] = postVersion;
    }

}
