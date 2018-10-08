import {ITopic} from "./ITopic";
import {IUser, IUserCensored} from "./IUser";
import {IEdit} from "./IEdit";

export interface IPost extends IPostBase {
    edits: IEdit[];
    approved: boolean;
    approvedBy: IUserCensored;
    rejectedReason: string;
}

export interface IPostReduced extends IPostBase {
    lastEdit: IEdit;
}

export interface IPostBase {
    topic: ITopic;
    author: IUserCensored;
    hash: number;
    datetime: string;
    title: string;
    upvotes: number;
    id: number;
}
