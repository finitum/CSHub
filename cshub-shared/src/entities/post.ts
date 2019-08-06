import {ITopic} from "./topic";
import {IUser} from "./user";

export interface IPost {

    id: number;

    topic: ITopic;

    author: IUser;

    datetime: Date;

    title: string;

    hash: number;

    postVersion: number;

    deleted: boolean;

    wip: boolean;

    isIndex: boolean;
}
