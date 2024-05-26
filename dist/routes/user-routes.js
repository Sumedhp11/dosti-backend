import express from "express";
import { checkUsernameExist, newUser } from "../controllers/user-controller.js";
import { singleAvatar } from "../utils/multerConfig.js";
const Router = express.Router();
Router.post("/new", singleAvatar, newUser);
Router.post("/check-username", checkUsernameExist);
export default Router;
