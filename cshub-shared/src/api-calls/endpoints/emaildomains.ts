import { IUser } from "../../entities/user";
import { IApiRequest } from "../../models";
import { Requests } from "../Requests";
import { IEmailDomain } from "../../entities/emaildomains";

export class GetEmailDomainsCallback {
    constructor(public domains: IEmailDomain[]) {}
}

export class GetEmailDomains implements IApiRequest<GetEmailDomainsCallback> {
    public static getURL: string = Requests.EMAILDOMAINS;
    public URL: string = GetEmailDomains.getURL;

    constructor() {}
}

export class PutEmailDomains implements IApiRequest<void> {
    public static getURL: string = Requests.EMAILDOMAINS;
    public URL: string = PutEmailDomains.getURL;

    constructor(public domain: IEmailDomain) {}
}

export class PostEmailDomainsCallback {
    constructor(public domain: IEmailDomain) {}
}


export class PostEmailDomains implements IApiRequest<PostEmailDomainsCallback> {
    public static getURL: string = Requests.EMAILDOMAINS;
    public URL: string = PostEmailDomains.getURL;

    constructor(public domain: string) {}
}

export class DeleteEmailDomains implements IApiRequest<void> {
    public static getURL: string = Requests.EMAILDOMAINS;
    public URL: string = PostEmailDomains.getURL;

    constructor(public domainid: number) {}
}
