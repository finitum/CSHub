// Documentation available here: https://github.com/RobbinBaauw/CSHub/wiki/Endpoints

export class Requests {
    public static readonly SUBMITPOST: string = "/post"; // POST
    public static readonly POSTDATA: string = "/post/:hash"; // GET
    public static readonly EDITPOST: string = "/post/:hash"; // PUT
    public static readonly POSTCONTENT: string = "/post/:hash/content"; // GET
    public static readonly EDITCONTENT: string = "/post/:hash/editcontent"; // GET
    public static readonly SQUASHEDITS: string = "/post/:hash/squash"; // PUT
    public static readonly POSTSETTINGS: string = "/post/:hash/:action"; // PUT, action = hide,wip

    public static readonly GETEXAMPLES: string = "/posts/:topichash/example"; // GET
    public static readonly GETUNVERIFIEDPOSTS: string = "/posts/unverified"; // GET
    public static readonly WIPPOSTS: string = "/posts/wip"; // GET
    public static readonly TOPICPOSTS: string = "/posts/:topichash"; // GET

    public static readonly TOPICS: string = "/topics"; // GET
    public static readonly RESTRUCTURETOPICS: string = "/topics/:id/restructure"; // PUT

    public static readonly GETSTUDIES: string = "/study"; // GET
    public static readonly GETALLSTUDIES: string = "/study/all"; // GET
    public static readonly HIDESTUDIES: string = "/study/:id/hide"; // PUT
    public static readonly UNHIDESTUDIES: string = "/study/:id/unhide"; // PUT
    public static readonly RENAMESTUDIES: string = "/study/:id/rename"; // PUT
    public static readonly CREATESTUDIES: string = "/study"; // POST

    public static readonly QUESTIONS: string = "/questions"; // GET
    public static readonly QUESTION: string = "/questions/:id"; // GET
    public static readonly FULLQUESTION: string = "/questions/:id/full"; // GET
    public static readonly EDITABLEQUESTIONS: string = "/questions/editable"; // GET
    public static readonly UNPUBLISHEDQUESTIONS: string = "/questions/unpublished"; // GET
    public static readonly ADDQUESTIONS: string = "/questions"; // POST
    public static readonly EDITQUESTION: string = "/questions/:id"; // PUT
    public static readonly CHECKANSWERS: string = "/questions/check"; // POST
    public static readonly QUESTIONSETTINGS: string = "/questions/:id/:action"; // PUT, action = approve,delete

    public static readonly LOGIN: string = "/login"; // POST
    public static readonly LOGOUT: string = "/logout"; // POST
    public static readonly CREATEACCOUNT: string = "/createaccount"; // POST
    public static readonly VERIFYTOKEN: string = "/verifytoken"; // POST

    public static readonly ALLUSERS: string = "/users/:page"; // GET
    public static readonly VERIFYMAIL: string = "/user/verifymail"; // GET
    public static readonly VERIFYUSER: string = "/user/verify"; // PUT
    public static readonly BLOCKUSER: string = "/user/block"; // PUT
    public static readonly SETADMINUSER: string = "/user/admin"; // PUT
    public static readonly SETSTUDYADMINUSER: string = "/user/studyadmin"; // PUT
    public static readonly FORGOTPASSWORDMAIL: string = "/user/forgotpasswordmail"; // POST
    public static readonly FORGOTPASSWORD: string = "/user/forgotpassword"; // POST
    public static readonly CHANGEPASSWORD: string = "/user/changepassword"; // POST
    public static readonly CHANGEAVATAR: string = "/user/changeavatar"; // POST

    public static readonly EMAILDOMAINS: string = "/emaildomains"; // GET, POST, PUT, DELETE

    public static readonly PROFILE = "/profile/:userId"; // GET, Is actually profile pic

    public static readonly DASHBOARD: string = "/dashboard"; // GET

    public static readonly SEARCH: string = "/search"; // POST
}
