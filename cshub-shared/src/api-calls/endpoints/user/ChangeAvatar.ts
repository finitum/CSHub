import { IApiRequest } from "../../../models";

import { Requests } from "../../Requests";

export class ChangeAvatarCallback {
    constructor(public response: false | string) {}
}

export class ChangeAvatar implements IApiRequest {
    public static getURL: string = Requests.CHANGEAVATAR;
    public URL: string = ChangeAvatar.getURL;

    constructor(public imageb64: string) {}
}
