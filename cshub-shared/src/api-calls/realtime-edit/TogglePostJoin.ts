import {ISocketRequest} from "../../models/ISocketRequest";
import {SocketRequests} from "../SocketRequests";
import {IServerEdit} from "./IServerEdit";

export class TogglePostJoin implements ISocketRequest {

    public static getURL: string = SocketRequests.TOGGLEPOST;
    public URL: string = TogglePostJoin.getURL;

    constructor(public postHash: number, public join: boolean, public callback: (serverData: IServerEdit) => void) {}

}
