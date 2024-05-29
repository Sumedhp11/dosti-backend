import express from "express";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { AddNewPost } from "../controllers/posts-controller.js";
import { singlePost } from "../utils/multerConfig.js";
const Router = express.Router();
Router.use(isAuthenticated);
Router.post("/new-post", singlePost, AddNewPost);
export default Router;
