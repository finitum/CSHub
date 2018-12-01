// @ts-ignore
import Delta from "quill-delta/dist/Delta";
import {Dayjs} from "dayjs";

export interface IServerEdit {
    delta: Delta;
    timestamp: Dayjs;
    serverId: number;
}