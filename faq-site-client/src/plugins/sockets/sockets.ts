import Vue from 'vue';
import socket from 'vue-socket.io';
import {ISocketCall} from '@/shared/socket-calls/ISocketCall';

const sockets = {
    connect: () => {
        console.log('Socket connected');
    }
};

Vue.use(socket, process.env.VUE_APP_SOCKETURL);

export const socketConn = new Vue({
    data() {
        return {
            ip: process.env.VUE_APP_SOCKETURL
        };
    },
    sockets
});

export class SocketWrapper {

    public static emit(emittableObject: ISocketCall): void {
        socketConn.$socket.emit(emittableObject.socketCallName, emittableObject, emittableObject.callbackFn);
    }
}
