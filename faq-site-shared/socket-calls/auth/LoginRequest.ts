import {IApiRequest} from "../../../faq-site-shared/models/IApiRequest";
import {AuthResponses} from "../../../faq-site-shared/socket-calls/auth/AuthResponses";
import {UserModel} from "../../../faq-site-shared/models/UserModel";

import {NonAuthRequests} from "../NonAuthRequests";

export class LoginRequestCallBack {

    constructor(
        public response: AuthResponses,
        public userModel?: UserModel
    ) {}
}

export class LoginRequest implements IApiRequest {

    public static getURL: string = NonAuthRequests.LOGINREQUEST;
    public URL: string = LoginRequest.getURL;

    constructor(
        public email: string,
        public password: string
    ) {}

}
