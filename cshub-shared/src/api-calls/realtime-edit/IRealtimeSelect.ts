import {RangeStatic} from "quill";
import {IUserCensored} from "../../models";

export interface IRealtimeSelect {
     color: string;
     user: IUserCensored;
     userName: string;
     postHash: number;
     active: boolean;
     selection: RangeStatic;
}
