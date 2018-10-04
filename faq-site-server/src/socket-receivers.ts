import {socketListener} from './index';
import {Socket} from 'socket.io';

import {LoginCallbackFn, LoginRequest} from '../../faq-site-shared/socket-calls/auth/LoginRequest';

import {login} from './auth/login';

socketListener.on('connection', (client: Socket) => {

    // Login
    client.on(LoginRequest.getCallName, (loginRequestObject: LoginRequest, callbackFn: LoginCallbackFn) => {
        login(loginRequestObject, callbackFn);
    });

});
