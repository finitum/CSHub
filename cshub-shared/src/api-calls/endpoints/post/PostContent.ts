import { IApiRequest } from "../../../models";
import { Requests } from "../../Requests";
import { IPost } from "../../../entities/post";

export enum PostVersionTypes {
    UPDATEDPOST,
    POSTDELETED,
}

export class GetPostContentCallBack {
    constructor(
        public data:
            | {
                  type: PostVersionTypes.UPDATEDPOST;
                  content: {
                      html: string;
                      approved: boolean;
                  };
                  postUpdated: IPost;
              }
            | {
                  type: PostVersionTypes.POSTDELETED;
              },
    ) {}
}

export class PostContent implements IApiRequest<GetPostContentCallBack> {
    public static getURL: string = Requests.POSTCONTENT;
    public URL: string = PostContent.getURL;

    public headers: any = {};
    public static readonly postVersionHeader = "X-Post-Version";

    constructor(postHash: number, postVersion: number) {
        this.URL = this.URL.replace(/:hash/, postHash.toString());
        this.headers[PostContent.postVersionHeader] = postVersion;
    }

    /**
     * @see IApiRequest.response
     */
    response?: GetPostContentCallBack;
}
