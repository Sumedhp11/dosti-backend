import express from "express";
import { getAllNotifications } from "../controllers/notification-controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

const Router = express.Router();
Router.use(isAuthenticated);
Router.get("/get-notifications", getAllNotifications);

export default Router;
