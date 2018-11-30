// @ts-ignore
import Delta from "quill-delta/dist/Delta";
import {Dayjs} from "dayjs";

export interface IUserEdit {
    delta: Delta;
    timestamp: Dayjs;
}
