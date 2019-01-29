import {IUserCensored} from "./IUser";
// @ts-ignore
import Delta from "quill-delta/dist/Delta";
import {Dayjs} from "dayjs";

export interface IEdit {
    parentPostId: number;
    content: Delta;
    editedBy: IUserCensored[];
    id: number;
    datetime: Dayjs;
    approved: boolean;
}
