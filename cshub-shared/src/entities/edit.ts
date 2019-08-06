import {IUser} from "./user";
import {IPost} from "./post";
import {IEditUser} from "./edituser";

export interface IEdit {

    id: number;

    post?: IPost;

    editusers?: IEditUser[];

    content: string;

    approved: boolean;

    approvedBy?: IUser;

    datetime?: Date;

    htmlContent: string;

    indexwords: string;
}
