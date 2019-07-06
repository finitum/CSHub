import {IApiRequest, IPost} from "../../../models";

import {Requests} from "../../Requests";

export class GetPostCallBack {

    constructor(
        public post: IPost
    ) {}
}

export class PostData implements IApiRequest {

    public static getURL: string = Requests.POSTDATA;
    public URL: string = PostData.getURL;

    constructor(postHash: number) {
        this.URL = this.URL.replace(/:hash/, postHash.toString());
    }

}
