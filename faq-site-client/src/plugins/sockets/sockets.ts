import Vue from 'vue'
import socket from 'Vue-Socket.io'

var sockets = {
    connect: function () {
        console.log("Socket connected")
    }
}

Vue.use(socket, address)

var socketconn = new Vue({
    data() {
        return {
            ip: address
        }
    },
    sockets: sockets
})

export default socketconn