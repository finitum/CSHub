import {IUserEdit} from "../../../../../cshub-shared/src/api-calls";
import {socketConnection} from "./socket-receiver";

export class EditDataHandler {

    private static previousEdits: IUserEdit[] = [];

    public static applyNewEdit(edit: IUserEdit): void {
        this.previousEdits.push(edit);
        console.log(this.previousEdits)
        console.log(socketConnection)
        return;
    }
}