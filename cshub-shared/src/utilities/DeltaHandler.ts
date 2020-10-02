import { IRealtimeEdit } from "../api-calls/realtime-edit";
import Delta from "quill-delta";

/**
 *
 * @param inputEdits the array where the last few edits are stored
 * @param newEdit the new edit
 * @param countUserDeltas whether to include the user's edits in the edit
 */
export const transformFromArray = (
    inputEdits: IRealtimeEdit[],
    newEdit: IRealtimeEdit,
    countUserDeltas: boolean,
): Delta | undefined => {
    const toBeTransformed: IRealtimeEdit[] = [];
    for (let i = inputEdits.length - 1; i >= 0; i--) {
        const iRealtimeEdit = inputEdits[i];
        if (iRealtimeEdit.serverGeneratedId === newEdit.prevServerGeneratedId) {
            break;
        } else if (countUserDeltas || iRealtimeEdit.userId !== newEdit.userId) {
            toBeTransformed.push(iRealtimeEdit);
        }
    }

    toBeTransformed.reverse();

    let editDelta: Delta | undefined = undefined;

    for (const transformable of toBeTransformed) {
        if (!editDelta) {
            editDelta = new Delta(transformable.delta);
        } else {
            editDelta = editDelta.compose(new Delta(transformable.delta));
        }
    }

    if (editDelta && newEdit.delta) {
        // Quill priority works the other way around
        return editDelta.transform(newEdit.delta, true);
    } else {
        return newEdit.delta;
    }
};
