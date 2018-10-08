// Using an enum for the names to avoid duplicates
export class NonAuthRequests {

    public static readonly LOGINREQUEST: string = "/api/0/login";
    public static readonly CREATEACCOUNTREQUEST: string = "/api/0/createaccount";
    public static readonly INDEXPOSTS: string = "/api/0/index";
    public static readonly POSTDATA: string = "/api/0/post";
    public static readonly TOPICS: string = "/api/0/topics";
}
