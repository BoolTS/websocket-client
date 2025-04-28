import { createInterface } from "readline";
import { SocketClient } from "../src";

const readLine = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> "
});

type TAdminEventMap = {
    chat: string;
    chit: string;
};

type TUserEventMap = {
    chat: string;
    chit: string;
};

const adminSocket = new SocketClient<TAdminEventMap>({
    url: "http://localhost:8877/admin?token=88768236487",
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
    debug: true
});

const userSocket = new SocketClient<TUserEventMap>({
    url: "http://localhost:8877/user?token=123123",
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
    debug: true
});

adminSocket.connect();
userSocket.connect();

readLine.on("line", (line) => {
    if (line === "admin_connect") {
        adminSocket.connect();
    }

    if (line === "admin_disconnect") {
        adminSocket.disconnect();
    }

    if (line === "user_connect") {
        userSocket.connect();
    }

    if (line === "user_disconnect") {
        userSocket.disconnect();
    }

    if (line === "admin_send_chat") {
        adminSocket.sendJson("chat", "Hello admin");
    }

    if (line === "admin_send_chit") {
        adminSocket.sendJson("chit", "Hello chit");
    }

    if (line === "user_send_chat") {
        userSocket.sendJson("chat", "Hello user");
    }

    if (line === "user_send_chit") {
        userSocket.sendJson("chit", "Hello chit");
    }

    readLine.prompt();
});
