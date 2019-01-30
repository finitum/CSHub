import {IApiRequest, IUser} from "../../models";
import {Requests} from "../Requests";

export enum PostSettingsEditType {
    HIDE,
    FAVORITE
}

export class HidePostCallBack {
}

export class PostSettings implements IApiRequest {
    public static getURL: string = Requests.POSTSETTINGS;
    public URL: string = PostSettings.getURL;

    constructor(postHash: number, editType: PostSettingsEditType.FAVORITE, favorite: boolean);
    constructor(postHash: number, editType: PostSettingsEditType.HIDE);
    constructor(public postHash: number, public editType: PostSettingsEditType, public favorite?: boolean) {}
}
