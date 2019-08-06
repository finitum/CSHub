import {IPost} from "./post";
import {IEditUser} from "./edituser";
import {IStudy} from "./study";
import {IEdit} from "./edit";

export interface IUser {

    id: number;

    email: string;

    password: string;

    avatar: string;

    admin: boolean;

    created: Date;

    blocked: boolean;

    verified: boolean;

    firstname: string;

    lastname: string;

    verifyhash: number;

    passresethash: number;

    posts: IPost[];

    edits: IEditUser[];

    approvedEdits: IEdit[];

    studies: IStudy[];
}
