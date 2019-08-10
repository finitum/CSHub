import { IPost } from "./post";
import { IStudy } from "./study";
import { IEdit } from "./edit";

export interface IUser {
    id: number;

    email: string;

    avatar: string;

    admin: boolean;

    blocked: boolean;

    verified: boolean;

    firstname: string;

    lastname: string;

    posts?: IPost[];

    edits?: IEdit[];

    approvedEdits?: IEdit[];

    studies?: IStudy[];
}
