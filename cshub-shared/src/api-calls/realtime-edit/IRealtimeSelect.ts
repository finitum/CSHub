import {RangeStatic} from "quill";
import {IUser} from "../../entities/user";

export interface IRealtimeSelect {
     color: string;
     user: IUser;
     userName: string;
     postHash: number;
     active: boolean;
     selection: RangeStatic;
}
