import cookie from "cookie";
import { userSocketIDs } from "../app.js";
const cookieParserMiddleware = (socket, next) => {
    const cookieHeader = socket.handshake.headers.cookie;
    if (!cookieHeader) {
        return next(new Error("No cookies found"));
    }
    const cookies = cookie.parse(cookieHeader);
    socket.request.cookies = cookies;
    next();
};
const emitEvent = (req, event, users, data) => {
    const io = req.app.get("io");
    const usersSocket = getSockets(users);
    io.to(usersSocket).emit(event, data);
};
const getSockets = (users = []) => {
    const sockets = users.map((user) => userSocketIDs.get(user.toString()));
    return sockets;
};
export { cookieParserMiddleware, emitEvent, getSockets };
