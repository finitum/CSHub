import {LoginCallbackFn, LoginRequest} from '../../../faq-site-shared/socket-calls/auth/LoginRequest';

export const login = (loginRequest: LoginRequest, callbackFn: LoginCallbackFn) => {
    callbackFn(true);
};
