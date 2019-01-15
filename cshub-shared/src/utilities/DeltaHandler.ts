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

    let editDelta: Delta = null;

    for (const transformable of toBeTransformed) {
        if (editDelta === null) {
            editDelta = new Delta(transformable.delta);
        } else {
            editDelta = editDelta.compose(new Delta(transformable.delta));
        }
    }

    const transformed = editDelta.transform(newEdit.delta, !newEditHasPriority); // Quill priority works the other way around

    return transformed;
};
