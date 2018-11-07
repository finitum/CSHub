import {IUserCensored} from "./IUser";

export interface IPost {
    topicHash: number;
    author: IUserCensored;
    hash: number;
    datetime: string;
    title: string;
    approved: boolean;
    upvotes: number;
    id: number;
    postVersion: number;
    htmlContent?: string;
}
