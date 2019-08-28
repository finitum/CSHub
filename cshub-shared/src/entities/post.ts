import { ITopic } from "./topic";

export interface IPost {
    id: number;

    topic: ITopic;

    datetime: Date;

    title: string;

    hash: number;

    postVersion: number;

    deleted: boolean;

    wip: boolean;

    isIndex: boolean;

    htmlContent?: string;
}
