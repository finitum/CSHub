import { IApiRequest } from "../../../models";
import { Requests } from "../../Requests";

export enum QuestionSettingsEditType {
    APPROVE,
    DELETE,
}

export class QuestionSettings implements IApiRequest<void> {
    public static getURL: string = Requests.QUESTIONSETTINGS;
    public URL: string = QuestionSettings.getURL;

    constructor(questionId: number, editType: QuestionSettingsEditType) {
        this.URL = this.URL.replace(/:id/, questionId.toString());
        this.URL = this.URL.replace(/:action/, QuestionSettingsEditType[editType].toLowerCase());
    }
}
