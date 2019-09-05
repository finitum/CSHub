import { IStudy } from "./study";
import { IEmailDomain } from "./emaildomains";

export interface IUser {
    id: number;

    email: string;

    avatar: string;

    admin: boolean;

    blocked: boolean;

    verified: boolean;

    firstname: string;

    lastname: string;

    studies: IStudy[];

    domain: IEmailDomain;
}
