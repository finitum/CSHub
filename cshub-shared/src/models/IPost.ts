import {IUserCensored} from "./IUser";

export interface IPost {
    topicHash: number;
    author: IUserCensored;
    hash: number;
    datetime: string;
    title: string;
    upvotes: number;
    id: number;
    isIndex: boolean;
    postVersion: number;
    htmlContent?: string;
    isMyFavorite?: boolean;
    isWIP: boolean;
}
