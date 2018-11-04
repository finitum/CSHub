import {IUserCensored} from "./IUser";
// @ts-ignore
import Delta from "quill-delta/dist/Delta";
import {Moment} from "moment";

export interface IEdit {
    parentPostId: number;
    content: Delta;
    editedBy: IUserCensored;
    approved: boolean;
    id: number;
    datetime: Moment;
}
