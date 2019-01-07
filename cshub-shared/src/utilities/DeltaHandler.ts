import {IRealtimeEdit} from "../api-calls/realtime-edit";

// @ts-ignore
import Delta from "quill-delta/dist/Delta";

/**
 *
 * @param inputEdits the array where the last few edits are stored
 * @param newEdit the new edit
 * @param newEditHasPriority whether the new edit has priority over the previous ones or it is less important (ie if the edit came earlier or later than edits in the array)
 */
export const transformFromArray = (inputEdits: IRealtimeEdit[], newEdit: IRealtimeEdit, newEditHasPriority: boolean): Delta => {
    const toBeTransformed: IRealtimeEdit[] = [];
    for (let i = inputEdits.length - 1; i >= 0; i--) {
        if (inputEdits[i].serverGeneratedId === newEdit.prevServerGeneratedId) {
            break;
        } else {
            toBeTransformed.push(inputEdits[i]);
        }
    }

    let editDelta = createDeltaObject(newEdit);

    for (let j = toBeTransformed.length - 1; j >= 0; j--) {
        const currTransformable = new Delta(toBeTransformed[j].delta);
        editDelta = currTransformable.transform(editDelta, !newEditHasPriority); // Quill priority works the other way around
    }

    return editDelta;
};

export const createDeltaObject = (inputEdit: IRealtimeEdit): Delta => {
    let delta: Delta = new Delta();
    if (inputEdit.delta !== null && typeof inputEdit.delta !== "undefined" && inputEdit.delta.ops.length > 0) {
        delta = inputEdit.delta;
    } else if (inputEdit.deltas !== null && typeof inputEdit.deltas !== "undefined" && inputEdit.deltas[0].ops.length > 0) {
        for (const editDelta of inputEdit.deltas) {
            delta = delta.concat(new Delta(editDelta));
        }
    }
    return delta;
};
