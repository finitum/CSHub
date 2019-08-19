import { IApiRequest } from "../../../models";
import { Requests } from "../../Requests";
import { IUser } from "../../../entities/user";
import { IStudy } from "../../../entities/study";

export class VerifyUser implements IApiRequest<void> {
    public static putURL: string = Requests.VERIFYUSER;
    public URL: string = VerifyUser.putURL;

    constructor(public user: IUser, public verified: boolean) {}
}

export class BlockUser implements IApiRequest<void> {
    public static putURL: string = Requests.BLOCKUSER;
    public URL: string = BlockUser.putURL;

    constructor(public user: IUser, public blocked: boolean) {}
}

export class SetAdminUser implements IApiRequest<void> {
    public static putURL: string = Requests.SETADMINUSER;
    public URL: string = SetAdminUser.putURL;

    constructor(public user: IUser, public admin: boolean) {}
}

export class SetStudyAdminUser implements IApiRequest<void> {
    public static putURL: string = Requests.SETSTUDYADMINUSER;
    public URL: string = SetStudyAdminUser.putURL;

    constructor(public user: IUser, public studies: IStudy[]) {}
}
