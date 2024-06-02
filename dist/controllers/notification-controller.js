import { ErrorHandler } from "../utils/ErrorClass.js";
import Notifications from "../models/notification-model.js";
const getAllNotifications = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return next(new ErrorHandler("User ID not found", 400));
        }
        const notifications = await Notifications.find({
            $or: [{ userId }, { relatedUser: userId }],
        }).sort({ createdAt: -1 });
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
