import { v2 as cloudinary } from "cloudinary";
import cookieParser from "cookie-parser";
import cors from "cors";
import { configDotenv } from "dotenv";
import express from "express";
import morgan from "morgan";
import { Server } from "socket.io";
import { v4 as uuid } from "uuid";
import ChatRouter from "./routes/chat-routes.js";
import notificationRouter from "./routes/notifications-routes.js";
import postRouter from "./routes/posts-routes.js";
import authRouter from "./routes/user-routes.js";

import { createServer } from "http";
import { Resend } from "resend";
import {
  EXITED,
  JOINED,
  NEW_MESSAGE,
  NEW_MESSAGE_ALERT,
  ONLINE_USERS,
} from "./constants/Events.js";
import { AuthenticatedSocket } from "./interfaces/types.js";
import { errorMiddleware } from "./middleware/ErrorMiddleware.js";
import { socketAuthenticated } from "./middleware/isAuthenticated.js";
import Message from "./models/message-model.js";
import { connectDb } from "./utils/connectDb.js";
import {
  cookieParserMiddleware,
  getSockets,
} from "./utils/socketCookieParser.js";
configDotenv();

const port = 8080;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});
app.set("io", io);
export const userSocketIDs = new Map();
const onlineUsers = new Set();
export const resend = new Resend(process.env.RESEND_API_KEY!);
connectDb();
app.use(
  cors({
    origin: ["http://localhost:5173", "https://dosti-frontend.vercel.app"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Working!");
});

io.use((socket, next) =>
  cookieParserMiddleware(socket as AuthenticatedSocket, next)
);
io.use((socket, next) =>
  socketAuthenticated(socket as AuthenticatedSocket, next)
);
io.on("connection", (socket: AuthenticatedSocket) => {
  if (socket.user && socket.user._id) {
    const userId = socket.user._id.toString();
    userSocketIDs.set(userId, socket.id);
    onlineUsers.add(userId);
    io.emit(JOINED, Array.from(onlineUsers));

    socket.on(
      NEW_MESSAGE,
      async ({
        chatId,
        memberIds,
        message,
      }: {
        chatId: string;
        memberIds: [];
        message: string;
      }) => {
        const messageForRealTime = {
          content: message,
          _id: uuid(),
          sender: {
            _id: userId,
            username: socket.user?.username,
          },
          chat: chatId,
          createdAt: new Date().toISOString(),
        };
        const messageForDb = {
          content: message,
          sender: userId,
          chat: chatId,
        };

        const membersSocket = getSockets(memberIds);

        io.to(membersSocket).emit(NEW_MESSAGE, {
          chatId,
          message: messageForRealTime,
        });

        const filteredMembersSocket = membersSocket.filter(
          (memberSocket) => memberSocket !== socket.id
        );

        io.to(filteredMembersSocket).emit(NEW_MESSAGE_ALERT, {
          chatId,
          message: message,
        });
        try {
          await Message.create(messageForDb);
        } catch (error: any) {
          throw new Error(error);
        }
      }
    );
    socket.on("disconnect", () => {
      if (userId) {
        onlineUsers.delete(userId);

        io.emit(EXITED, Array.from(onlineUsers));
      }
    });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/posts", postRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/chat", ChatRouter);

app.use(errorMiddleware);
server.listen(port, () => {
  console.log("Server Working on Port " + port);
});
