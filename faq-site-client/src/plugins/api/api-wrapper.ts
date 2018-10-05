import axios, {AxiosResponse} from 'axios';

import {IApiRequest} from '@/shared/models/IApiRequest';
import {LoginRequestCallBack} from '@/shared/socket-calls/auth/LoginRequest';

export class ApiWrapper {

    public static sendRequest(request: IApiRequest) {
        axios
            .post(process.env.VUE_APP_SOCKETURL + request.URL)
            .then((login: AxiosResponse<LoginRequestCallBack>) => {
                console.log(login.data);
            });
    }
}