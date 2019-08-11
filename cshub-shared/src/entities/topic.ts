import { IStudy } from "./study";

export interface ITopic {
    id: number;

    parent: ITopic | null;

    children: ITopic[];

    name: string;

    hash: number;

    study?: IStudy;
}
