import {server} from "../../../index";
import socket, {Socket} from "socket.io";

const io = socket(server);

io.on("connection", (socket: Socket) => {
    socket.on("", () => {

    });

    socket.on("", () => {

    });
});
