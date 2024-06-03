import { ErrorHandler } from "../utils/ErrorClass.js";
import Chat from "../models/chat-model.js";
const newChatcontroller = async (req, res, next) => {
    try {
        const { groupName, selectedUsers } = req.body;
        if (!selectedUsers)
            return next(new ErrorHandler("Please provide Users", 400));
        const allMembers = [...selectedUsers, req.userId];
        const newChat = await Chat.create({
            name: groupName || "",
            isGroupChat: allMembers.length > 2 ? true : false,
            members: allMembers,
            creator: req.userId,
        });
        return res.status(201).json({
            success: true,
            message: "Chat Created Successfully",
            data: newChat,
        });
    }
    catch (error) {
        console.log(error);
        return next(new ErrorHandler("Internal Server Error", 500));
    }
};
const getAllChats = async (req, res, next) => {
    try {
        const allChats = await Chat.find({
            members: req.userId,
        })
            .populate({
            path: "members",
            model: "User",
            select: ["username", "avatar"],
        })
            .populate({
            path: "creator",
            model: "User",
            select: ["username", "avatar"],
        });
        if (!allChats)
            return next(new ErrorHandler("No Chats Found!", 400));
        return res.status(200).json({
            success: true,
            message: "Retrieved All Chats Successfully",
            data: allChats,
        });
    }
    catch (error) {
        console.log(error);
        return next(new ErrorHandler("Internal Server Error", 500));
    }
};
export { newChatcontroller, getAllChats };
