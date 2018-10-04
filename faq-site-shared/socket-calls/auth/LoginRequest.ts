import {ISocketCall} from '../ISocketCall';
import {SocketCallNames} from '../SocketCallNames';

export type LoginCallbackFn = (loggedon: boolean) => void;

export class LoginRequest implements ISocketCall {

    public static getCallName: string = SocketCallNames.LOGINREQUEST.toString();
    public socketCallName: string = LoginRequest.getCallName;

    constructor(
        public username: string,
        public password: string,
        public callbackFn: LoginCallbackFn
    ) {}

}
