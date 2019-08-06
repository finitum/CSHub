import {IPost} from "./post";
import {IStudy} from "./study";

export interface ITopic {

    id: number;

    parent?: ITopic;

    children?: ITopic[];

    posts?: IPost[];

    study?: IStudy;

    name: string;

    hash: number;

    cacheVersion: number;
}
