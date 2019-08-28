import { ITopic } from "./topic";

export interface IStudy {
    id: number;

    name: string;

    topTopic: ITopic;

    hidden: boolean;
}
