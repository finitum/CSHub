import { IApiRequest } from "../../../models";
import { Requests } from "../../Requests";

export enum QuestionSettingsEditType {
    APPROVE,
    DELETE
}

export class QuestionSettingsCallback {}

export class QuestionSettings implements IApiRequest {
    public static getURL: string = Requests.QUESTIONSETTINGS;
    public URL: string = QuestionSettings.getURL;

    constructor(questionId: number, editType: QuestionSettingsEditType) {
        this.URL = this.URL.replace(/:id/, questionId.toString());
        this.URL = this.URL.replace(/:action/, QuestionSettingsEditType[editType].toLowerCase());
    }
}
