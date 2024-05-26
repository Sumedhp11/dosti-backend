import express from "express";
import { checkUsernameExist, newUser } from "../controllers/user-controller.js";

const Router = express.Router();
Router.post("/new", newUser);
Router.post("/check-username", checkUsernameExist);
export default Router;
