import { IStudy } from "./study";

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
}
