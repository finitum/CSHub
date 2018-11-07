// Using an enum for the names to avoid duplicates
export class NonAuthRequests {

    public static readonly LOGINREQUEST: string = "/0/login";
    public static readonly CREATEACCOUNTREQUEST: string = "/0/createaccount";
    public static readonly TOPICPOSTS: string = "/0/topicposts";
    public static readonly POSTDATA: string = "/0/post";
    public static readonly POSTCONTENT: string = "/0/postcontent";
    public static readonly TOPICS: string = "/0/topics";
    public static readonly VERIFYTOKEN: string = "/0/verifytoken";
    public static readonly VERIFYMAIL: string = "/0/verifymail";
    public static readonly SEARCH: string = "/0/search";
    public static readonly FORGOTPASSWORDMAIL: string = "/0/forgotpasswordmail";
    public static readonly FORGOTPASSWORD: string = "/0/forgotpassword";
}
