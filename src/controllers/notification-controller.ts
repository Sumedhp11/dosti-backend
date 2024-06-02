import { NextFunction, Response } from "express";
import { AuthenticatedInterface } from "../middleware/isAuthenticated.js";
import { ErrorHandler } from "../utils/ErrorClass.js";
import Notifications from "../models/notification-model.js";

const getAllNotifications = async (
  req: AuthenticatedInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return next(new ErrorHandler("User ID not found", 400));
    }

    const notifications = await Notifications.find({
      relatedUser: userId,
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "userId",
        model: "User",
        select: ["username", "avatar"],
      })
      .populate({
        path: "relatedUser",
        model: "User",
        select: ["username", "avatar"],
      });

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export { getAllNotifications };
