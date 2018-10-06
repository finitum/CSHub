import {NonAuthRequests} from '../NonAuthRequests';
import {IApiRequest} from '../../../faq-site-shared/models/IApiRequest';
import {AuthResponses} from '../../../faq-site-shared/socket-calls/auth/AuthResponses';

export class LoginRequestCallBack {

    constructor(
        public response: AuthResponses
    ) {}
}

export class LoginRequest implements IApiRequest {

    public static getURL: string = NonAuthRequests.LOGINREQUEST;
    public URL: string = LoginRequest.getURL;

    constructor(
        public username: string,
        public password: string
    ) {}

}
