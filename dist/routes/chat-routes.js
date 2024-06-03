import express from "express";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { newChatcontroller } from "../controllers/chat-controller.js";
const Router = express.Router();
Router.use(isAuthenticated);
Router.post("/new", newChatcontroller);
export default Router;
