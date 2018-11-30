// @ts-ignore
import VueSocketIO from "vue-socket.io";
import Vue from "vue";

const socket = new VueSocketIO({
    connection: `${process.env.VUE_APP_SOCKET_URL}`,
});

Vue.use(socket);
