import cookie from "cookie";
import { AuthenticatedSocket } from "../interfaces/types.js";
import { AuthenticatedInterface } from "../middleware/isAuthenticated.js";
import { userSocketIDs } from "../app.js";
const cookieParserMiddleware = (socket: AuthenticatedSocket, next: any) => {
  const cookieHeader = socket.handshake.headers.cookie;
  if (!cookieHeader) {
    return next(new Error("No cookies found"));
  }
  const cookies = cookie.parse(cookieHeader);
  socket.request.cookies = cookies;
  next();
};

const emitEvent = (
  req: AuthenticatedInterface,
  event: string,
  users: any,
  data?: any
) => {
  const io = req.app.get("io");
  const usersSocket = getSockets(users);

  io.to(usersSocket).emit(event, data);
};

const getSockets = (users = []) => {
  const sockets = users.map((user: string) =>
    userSocketIDs.get(user.toString())
  );

  return sockets;
};
export { cookieParserMiddleware, emitEvent, getSockets };
