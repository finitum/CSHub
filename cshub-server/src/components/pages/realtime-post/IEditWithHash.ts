import {IUserEdit} from "../../../../../cshub-shared/src/api-calls/realtime-edit";

export interface IEditWithHash {
    edit: IUserEdit;
    hash: number;
}