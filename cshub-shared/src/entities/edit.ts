import { IUser } from "./user";
import { IPost } from "./post";

// @ts-ignore
import Delta from "quill-delta";

export interface IEdit {
    id: number;

    post?: IPost;

    editusers?: IUser[];

    content: Delta;

    approved: boolean;

    approvedBy?: IUser;

    datetime?: Date;

    htmlContent: string;

    indexwords: string;
}
