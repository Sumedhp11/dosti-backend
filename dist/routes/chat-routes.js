import express from "express";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { getAllChats, getAllMessages, newChatcontroller, } from "../controllers/chat-controller.js";
const Router = express.Router();
Router.use(isAuthenticated);
Router.post("/new", newChatcontroller);
Router.get("/get-all-chats", getAllChats);
Router.get("/get-all-messages", getAllMessages);
export default Router;
