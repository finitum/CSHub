import { ITopic } from "./topic";
import { IUser } from "./user";

export interface IStudy {
    id: number;

    name: string;

    topTopic?: ITopic;

    admins?: IUser[];
}
