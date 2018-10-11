export interface IUser extends IUserCensored {
    email: string;
    blocked: boolean;
    verified: boolean;
}

export interface IUserCensored {
    admin: boolean;
    id: number;
    firstname: string;
    lastname: string;
    avatar: string;
}
