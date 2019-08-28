
import { ISocketRequest } from "../../models/ISocketRequest";
import { SocketRequests } from "../SocketRequests";
import { Message } from "automerge";


export class AutomergeUpdatePackage implements ISocketRequest {
    public static getURL: string = SocketRequests.AUTOMERGEUPDATE;
    public URL: string = AutomergeUpdatePackage.getURL;

    constructor(public message: Message) {}
}
