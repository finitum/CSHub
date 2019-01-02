// @ts-ignore
import Delta from "quill-delta/dist/Delta";
import {Dayjs} from "dayjs";

export interface IRealtimeEdit {
    postHash: number;
    delta?: Delta;
    timestamp: Dayjs;
    prevServerGeneratedId?: number;
    serverGeneratedId?: number;
    userId?: number;
    userGeneratedId: number;
    deltas?: Delta[];
}
