import express from "express";
import { VerifyUser, checkUsernameExist, newUser, } from "../controllers/user-controller.js";
import { singleAvatar } from "../utils/multerConfig.js";
const Router = express.Router();
Router.post("/new", singleAvatar, newUser);
Router.post("/check-username", checkUsernameExist);
Router.post("/verify", VerifyUser);
export default Router;
