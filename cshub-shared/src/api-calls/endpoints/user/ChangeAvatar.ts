import {IApiRequest} from "../../../models";

import {Requests} from "../../Requests";

export enum ChangeAvatarResponseTypes {
    SUCCESS,
    INVALIDIMAGE
}

export class ChangeAvatarCallback {

    constructor(
        public response: ChangeAvatarResponseTypes,
        public newAvatar?: string
    ) {}
}

export class ChangeAvatar implements IApiRequest {

    public static getURL: string = Requests.CHANGEAVATAR;
    public URL: string = ChangeAvatar.getURL;

    constructor(public imageb64: string) {}
}
