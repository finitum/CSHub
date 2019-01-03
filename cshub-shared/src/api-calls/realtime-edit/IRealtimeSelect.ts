import {RangeStatic} from "quill";

export interface IRealtimeSelect {
     color: string;
     userId: number;
     userName: string;
     postHash: number;
     active: boolean;
     selection: RangeStatic;
}
