import { v2 as cloudinary } from "cloudinary";
import cookieParser from "cookie-parser";
import cors from "cors";
import { configDotenv } from "dotenv";
import express from "express";
import morgan from "morgan";
import { Server } from "socket.io";
import postRouter from "./routes/posts-routes.js";
import authRouter from "./routes/user-routes.js";

import { createServer } from "http";
import { Resend } from "resend";
import { errorMiddleware } from "./middleware/ErrorMiddleware.js";
import { socketAuthenticated } from "./middleware/isAuthenticated.js";
import { connectDb } from "./utils/connectDb.js";
import { cookieParserMiddleware } from "./utils/socketCookieParser.js";
import { AuthenticatedSocket } from "./interfaces/types.js";
import { friendRequest } from "./constants/Events.js";
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
export const resend = new Resend(process.env.RESEND_API_KEY!);
connectDb();
app.use(
  cors({
    origin: ["http://localhost:5173"],
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
  }
});

app.use("/api/auth", authRouter);
app.use("/api/posts", postRouter);

app.use(errorMiddleware);
server.listen(port, () => {
  console.log("Server Working on Port " + port);
});
