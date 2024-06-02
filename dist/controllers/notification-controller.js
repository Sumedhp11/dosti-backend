import { ErrorHandler } from "../utils/ErrorClass.js";
import Notifications from "../models/notification-model.js";
const getAllNotifications = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return next(new ErrorHandler("User ID not found", 400));
        }
        const postInteractionNotifications = await Notifications.find({
            userId,
            type: "Post_Interaction",
        })
            .sort({ createdAt: -1 })
            .populate({
            path: "relatedUser",
            model: "User",
            select: ["username", "avatar"],
        });
        const friendRequestNotifications = await Notifications.find({
            type: "Friend_Request",
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
        const notifications = [
            ...postInteractionNotifications,
            ...friendRequestNotifications,
        ];
        notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return res.status(200).json({
            success: true,
            notifications,
        });
    }
    catch (error) {
        console.error(error);
        return next(new ErrorHandler("Internal Server Error", 500));
    }
};
export { getAllNotifications };
