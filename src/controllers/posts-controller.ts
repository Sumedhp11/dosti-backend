import { NextFunction, Response } from "express";
import { AuthenticatedInterface } from "../middleware/isAuthenticated.js";
import { ErrorHandler } from "../utils/ErrorClass.js";
import Posts from "../models/posts-models.js";
import { uploadFilesToCloudinary } from "../utils/cloudinary.js";

const AddNewPost = async (
  req: AuthenticatedInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const { caption } = req.body;
    const file = req.file;
    if (!caption || !file)
      return next(new ErrorHandler("Please Provide Content And Caption", 400));
    const contentLink = await uploadFilesToCloudinary([file]);
    const newPosts = new Posts({
      caption,
      content: contentLink[0].public_id,
      likes: 0,
      comments: [],
      userId: req.userId,
    });
    const newsavedPost = await newPosts.save();
    return res.status(200).json({
      status: true,
      message: "New Post Added Successfully",
      data: newsavedPost,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

const getAllPosts = async (
  req: AuthenticatedInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1 } = req.query;
    const limit = 10;
    const skip = (Number(page) - 1) * limit;
    const totalDocs = await Posts.countDocuments();
    const allPosts = await Posts.find({})
      .populate({
        path: "userId",
        model: "User",
        select: ["username", "avatar"],
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    if (!allPosts.length) return next(new ErrorHandler("No Posts Found!", 400));
    return res.status(200).json({
      success: true,
      message: "Retrieved All Posts",
      data: {
        posts: allPosts,
        totalPages: Math.ceil(totalDocs / limit),
        currentPage: Number(page),
      },
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export { AddNewPost, getAllPosts };
