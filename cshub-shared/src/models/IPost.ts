import {IUserCensored} from "./IUser";

export interface IPost {
    topicHash: number;
    author: IUserCensored;
    hash: number;
    datetime: string;
    title: string;
    id: number;
    isIndex: boolean;
    postVersion: number;
    isWIP: boolean;
    htmlContent?: string;
}
