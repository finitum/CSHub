// Documentation available here: https://github.com/RobbinBaauw/CSHub/wiki/Endpoints

export class Requests {
    public static readonly SUBMITPOST: string = "/post"; // POST
    public static readonly POSTDATA: string = "/post/:hash"; // GET
    public static readonly EDITPOST: string = "/post/:hash"; // PUT
    public static readonly POSTCONTENT: string = "/post/:hash/content"; // GET
    public static readonly EDITCONTENT: string = "/post/:hash/editcontent"; // GET
    public static readonly SQUASHEDITS: string = "/post/:hash/squash"; // PUT
    public static readonly FORCEEDITPOST: string = "/post/:hash/forcesave"; // PUT
    public static readonly POSTSETTINGS: string = "/post/:hash/:action"; // PUT, action = hide,wip

    public static readonly GETUNVERIFIEDPOSTS: string = "/posts/unverified"; // GET
    public static readonly WIPPOSTS: string = "/posts/wip"; // GET
    public static readonly TOPICPOSTS: string = "/posts/topic/:topichash"; // GET

    public static readonly TOPICS: string = "/topics"; // GET
    public static readonly SUBMITTOPIC: string = "/topics"; // POST

    public static readonly GETSTUDIES: string = "/study"; // GET
    public static readonly GETALLSTUDIES: string = "/study/all"; // GET
    public static readonly HIDESTUDIES: string = "/study/hide"; // POST
    public static readonly UNHIDESTUDIES: string = "/study/unhide"; // POST
    public static readonly RENAMESTUDIES: string = "/study/rename"; // POST
    public static readonly CREATESTUDIES: string = "/study"; // POST

    public static readonly QUESTIONS: string = "/questions"; // GET
    public static readonly UNPUBLISHEDQUESTIONS: string = "/questions/unpublished"; // GET
    public static readonly ADDQUESTIONS: string = "/questions"; // POST
    public static readonly EDITQUESTION: string = "/questions/:id"; // PUT
    public static readonly CHECKANSWERS: string = "/questions/check"; // POST
    public static readonly QUESTIONSETTINGS: string = "/questions/:id/:action"; // PUT, action = approve,delete

    public static readonly LOGIN: string = "/login"; // POST
    public static readonly CREATEACCOUNT: string = "/createaccount"; // POST
    public static readonly VERIFYTOKEN: string = "/verifytoken"; // POST

    public static readonly ALLUSERS: string = "/users/:page"; // GET
    public static readonly VERIFYMAIL: string = "/user/verifymail"; // GET
    public static readonly FORGOTPASSWORDMAIL: string = "/user/forgotpasswordmail"; // POST
    public static readonly FORGOTPASSWORD: string = "/user/forgotpassword"; // POST
    public static readonly CHANGEPASSWORD: string = "/user/changepassword"; // POST
    public static readonly CHANGEAVATAR: string = "/user/changeavatar"; // POST

    public static readonly PROFILE = "/profile/:userId"; // GET, Is actually profile pic

    public static readonly DASHBOARD: string = "/dashboard"; // GET

    public static readonly SEARCH: string = "/search"; // POST
}
