import {LoginRequest, LoginRequestCallBack} from '../../../faq-site-shared/socket-calls/auth/LoginRequest';
import {app} from '../';
import {Request, Response} from 'express';

app.post(LoginRequest.getURL, (req: Request, res: Response) => {

    const loginRequest: LoginRequest = req.body as LoginRequest;

    const response: LoginRequestCallBack = {
        loggedin: true
    };

    res.json(response);
});
