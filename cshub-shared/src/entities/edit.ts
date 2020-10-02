import { IUser } from "./user";
import Delta from "quill-delta";

export interface IEdit {
    id: number;

    editusers: IUser[];

    content: Delta;

    approved: boolean;

    datetime: Date;

    htmlContent: string;
}
