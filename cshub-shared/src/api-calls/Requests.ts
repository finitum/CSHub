export class Requests {
    public static readonly SUBMITPOST: string = "/post"; // POST
    public static readonly POSTDATA: string = "/post/:hash"; // GET
    public static readonly EDITPOST: string = "/post/:hash"; // PUT
    public static readonly POSTCONTENT: string = "/postcontent"; // GET
    public static readonly SQUASHEDITS: string = "/post/:hash/squash"; // PUT
    public static readonly FORCEEDITPOST: string = "/post/:hash/forcesave"; // PUT
    public static readonly EDITCONTENT: string = "/editcontent";
    public static readonly POSTSETTINGS: string = "/postsettings";
    public static readonly GETUNVERIFIEDPOSTS: string = "/unverifiedposts";
    public static readonly WIPPOSTS: string = "/wipposts";

    public static readonly TOPICS: string = "/topics";
    public static readonly TOPICPOSTS: string = "/topicposts";
    public static readonly SUBMITTOPIC: string = "/createtopic";

    public static readonly LOGINREQUEST: string = "/login";
    public static readonly CREATEACCOUNTREQUEST: string = "/createaccount";
    public static readonly VERIFYTOKEN: string = "/verifytoken";

    public static readonly GETALLUSERS: string = "/allusers";
    public static readonly VERIFYMAIL: string = "/verifymail";
    public static readonly FORGOTPASSWORDMAIL: string = "/forgotpasswordmail";
    public static readonly FORGOTPASSWORD: string = "/forgotpassword";
    public static readonly CHANGEPASSWORD: string = "/changepassword";
    public static readonly CHANGEAVATAR: string = "/changeavatar";

    public static readonly DASHBOARD: string = "/dashboard";
    public static readonly PROFILE = "/profile";
    public static readonly SEARCH: string = "/search";
}
