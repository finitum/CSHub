// @ts-ignore
import Delta from "quill-delta/dist/Delta";
import {Dayjs} from "dayjs";

export interface IRealtimeEdit {
    postHash: number;
    delta: Delta;
    timestamp: Dayjs;
    previousEditHash?: number;
    editHash?: number;
    userId?: number;
    userGeneratedIdentifier: number;
}
