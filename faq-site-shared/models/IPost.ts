import {ITopic} from "./ITopic";
import {IUserCensored} from "./IUser";
import {IEdit} from "./IEdit";

export interface IPost {
    edits: IEdit[];
    topic: ITopic;
    author: IUserCensored;
    datetime: string;
    title: string;
    upvotes: number;
    id: number;
    approved: boolean;
    approvedBy: IUserCensored;
    rejectedReason: string;
}
