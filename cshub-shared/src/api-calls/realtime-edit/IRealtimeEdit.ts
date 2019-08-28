// @ts-ignore
import Delta from "quill-delta/dist/Delta";
import { Dayjs } from "dayjs";

export interface IRealtimeEdit {
    postHash: number;
    userId?: number;
    timestamp: Dayjs | null;
    delta?: Delta;
    prevServerGeneratedId?: number;
    serverGeneratedId?: number;
    prevUserGeneratedId?: number;
    userGeneratedId: number;
}
