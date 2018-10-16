// Using an enum for the names to avoid duplicates
export class AdminRequests {

    public static readonly SUBMITTOPIC: string = "/2/createtopic";
    public static readonly GETALLUSERS: string = "/2/allusers";
    public static readonly GETUNVERIFIEDPOSTS: string = "/2/unverifiedposts";
    public static readonly VERIFYPOST: string = "/2/verifypost";
}
