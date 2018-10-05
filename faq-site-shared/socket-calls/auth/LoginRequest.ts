import {NonAuthRequests} from '../NonAuthRequests';
import {IApiRequest} from '../../../faq-site-shared/models/IApiRequest';

export interface LoginRequestCallBack {
    loggedin: boolean;
}

export class LoginRequest implements IApiRequest {

    public static getURL: string = NonAuthRequests.LOGINREQUEST;
    public URL: string = LoginRequest.getURL;

    constructor(
        public username: string,
        public password: string
    ) {}

}
