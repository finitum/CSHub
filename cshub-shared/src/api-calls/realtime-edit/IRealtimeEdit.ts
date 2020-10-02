import Delta from "quill-delta";
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
