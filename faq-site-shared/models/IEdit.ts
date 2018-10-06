import {IUserCensored} from "./IUser";

export interface IEdit {
    parentPostId: number;
    content: string;
    editedBy: IUserCensored;
    approved: boolean;
    approvedBy: IUserCensored;
    rejectedReason: string;
    id: number;
    datetime: string;
}
