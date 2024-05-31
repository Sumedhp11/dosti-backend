import { NextFunction, Response } from "express";
import { AuthenticatedInterface } from "../middleware/isAuthenticated.js";
import { ErrorHandler } from "../utils/ErrorClass.js";
import Posts from "../models/posts-models.js";
import { uploadFilesToCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

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
      likes: [],
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
    const [totalDocs, allPosts] = await Promise.all([
      Posts.countDocuments(),
      await Posts.find({})
        .populate({
          path: "userId",
          model: "User",
          select: ["username", "avatar"],
        })
        .populate({
          path: "comments.userId",
          model: "User",
          select: ["username", "avatar"],
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

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

const LikePost = async (
  req: AuthenticatedInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const { postId } = req.query;
    if (!postId) return next(new ErrorHandler("Please Provide postId", 400));
    const post = await Posts.findById(postId);
    if (!post)
      return next(new ErrorHandler("Post Not Found For this PostId", 400));
    const likes = post.likes;
    const alreadyLiked = likes.findIndex(
      (like) => String(like) === String(req.userId)
    );
    if (alreadyLiked !== -1) {
      post.likes.splice(alreadyLiked, 1);
    } else {
      post.likes.push(req.userId!);
    }

    await post.save();
    return res.status(200).json({
      success: true,
      message: "Likes Updated Successfully",
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};
const addComment = async (
  req: AuthenticatedInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const { postId, comment } = req.body;
    if (!postId || !comment)
      return next(new ErrorHandler("Please Provide PostId and Comment", 400));
    const post = await Posts.findById(postId);
    if (!post) return next(new ErrorHandler("Post Not Found!", 400));
    post.comments.push({
      userId: req.userId!,
      comment: comment,
      updatedAt: new Date(),
      createdAt: new Date(),
    });
    await post.save();
    return res.status(200).json({
      success: true,
      message: "Comment added successfully",
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export { AddNewPost, getAllPosts, LikePost, addComment };
