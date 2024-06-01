import express from "express";
import {
  VerifyUser,
  checkUsernameExist,
  newUser,
  loginUser,
  forgetPasswordemailController,
  resetPassword,
  GetMyProfile,
  logoutController,
  sendFriendRequest,
} from "../controllers/user-controller.js";
import { singleAvatar } from "../utils/multerConfig.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

const Router = express.Router();
Router.post("/new", singleAvatar, newUser);
Router.post("/check-username", checkUsernameExist);
Router.post("/verify", VerifyUser);
Router.post("/login", loginUser);
Router.post("/send-forget-password-email", forgetPasswordemailController);
Router.post("/reset-password", resetPassword);
Router.get("/get-me", isAuthenticated, GetMyProfile);
Router.get("/logout", isAuthenticated, logoutController);
Router.get("/send-request/:receiverUserId", isAuthenticated, sendFriendRequest);

export default Router;
