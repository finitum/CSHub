import Vue from 'vue'
import socket from 'Vue-Socket.io'

var sockets = {
    connect: function () {
        console.log("Socket connected")
    }
}

Vue.use(socket, "localhost:3000");

var socketconn = new Vue({
    data() {
        return {
            ip: "localhost:3000"
        }
    },
    sockets: sockets
})

export default socketconn