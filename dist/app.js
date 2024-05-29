import express from "express";
import { configDotenv } from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { v2 as cloudinary } from "cloudinary";
import cookieParser from "cookie-parser";
import authRouter from "./routes/user-routes.js";
import { errorMiddleware } from "./middleware/ErrorMiddleware.js";
import { connectDb } from "./utils/connectDb.js";
import { Resend } from "resend";
configDotenv();
const port = 8080;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const app = express();
export const resend = new Resend(process.env.RESEND_API_KEY);
connectDb();
app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
//routes
app.use("/api/auth", authRouter);
app.get("/", (req, res) => {
    res.send("Working!");
});
app.use(errorMiddleware);
app.listen(port, () => {
    console.log("Server Working on Port " + port);
});
