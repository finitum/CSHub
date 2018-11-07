import {IApiRequest} from "../../../models/IApiRequest";

import {AuthRequests} from "../../AuthRequests";

export enum ChangeUserAvatarReponseTypes {
    SUCCESS,
    INVALIDIMAGE
}

export class ChangeUserAvatarCallback {

    constructor(
        public response: ChangeUserAvatarReponseTypes,
        public newAvatar?: string
    ) {}
}

export class ChangeUserAvatar implements IApiRequest {

    public static getURL: string = AuthRequests.CHANGEAVATAR;
    public URL: string = ChangeUserAvatar.getURL;

    constructor(public imageb64: string) {}
}
