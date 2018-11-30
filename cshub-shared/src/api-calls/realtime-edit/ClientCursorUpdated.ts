import {IApiRequest} from "../../models";
import {SocketRequests} from "../SocketRequests";

export class ClientCursorUpdatedCallBack {
}

export class ClientCursorUpdated implements IApiRequest {

    public static getURL: string = SocketRequests.CLIENTCURSORUPDATED;
    public URL: string = ClientCursorUpdated.getURL;

}
