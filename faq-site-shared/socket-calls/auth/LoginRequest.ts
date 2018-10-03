import {ISocketCall} from "../ISocketCall";
import {SocketCallNames} from "../SocketCallNames";

export class LoginRequest implements ISocketCall {

    public socketCallName: number = SocketCallNames.LOGINREQUEST;

    constructor(
        public username: string,
        public password: string,
        public callback: (loggedon: boolean) => void
    ) {}

}