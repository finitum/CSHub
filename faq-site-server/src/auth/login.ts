import {socket} from '../';
import {SocketCallNames} from "../../../faq-site-shared/socket-calls/SocketCallNames";
import {LoginRequest} from "../../../faq-site-shared/socket-calls/auth/LoginRequest";

socket.on(SocketCallNames.LOGINREQUEST.toString(), (loginRequest: LoginRequest) => {
    loginRequest.callback(true)

});
