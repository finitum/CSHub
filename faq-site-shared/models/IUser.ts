export interface IUser extends IUserCensored {
    email: string;
    blocked: number;
    verified: number;
}

export interface IUserCensored {
    admin: boolean;
    id: number;
    firstname: string;
    lastname: string;
    avatar: string;
}
