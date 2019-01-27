import {IApiRequest} from "../../../models/IApiRequest";

import {Requests} from "../../Requests";

export enum ChangeUserAvatarResponseTypes {
    SUCCESS,
    INVALIDIMAGE
}

export class ChangeUserAvatarCallback {

    constructor(
        public response: ChangeUserAvatarResponseTypes,
        public newAvatar?: string
    ) {}
}

export class ChangeUserAvatar implements IApiRequest {

    public static getURL: string = Requests.CHANGEAVATAR;
    public URL: string = ChangeUserAvatar.getURL;

    constructor(public imageb64: string) {}
}
