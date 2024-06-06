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
  ManageFriendRequest,
  getAllUsers,
  editProfile,
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
Router.get("/get-All-users", isAuthenticated, getAllUsers);
Router.get("/send-request/:receiverUserId", isAuthenticated, sendFriendRequest);
Router.post("/manage-friend-request", isAuthenticated, ManageFriendRequest);
Router.post("/edit-profile", isAuthenticated, singleAvatar, editProfile);

export default Router;
