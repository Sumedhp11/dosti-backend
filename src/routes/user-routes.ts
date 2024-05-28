import express from "express";
import {
  VerifyUser,
  checkUsernameExist,
  newUser,
  loginUser,
  forgetPasswordemailController,
  resetPassword,
} from "../controllers/user-controller.js";
import { singleAvatar } from "../utils/multerConfig.js";

const Router = express.Router();
Router.post("/new", singleAvatar, newUser);
Router.post("/check-username", checkUsernameExist);
Router.post("/verify", VerifyUser);
Router.post("/login", loginUser);
Router.post("/send-forget-password-email", forgetPasswordemailController);
Router.post("/reset-password", resetPassword);

export default Router;
