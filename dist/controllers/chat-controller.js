import { ErrorHandler } from "../utils/ErrorClass.js";
import Chat from "../models/chat-model.js";
import Message from "../models/message-model.js";
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
const getAllMessages = async (req, res, next) => {
    try {
        const { chatId } = req.query;
        const { page = 1 } = req.query;
        const limit = 20;
        const skip = (Number(page) - 1) * limit;
        const userId = req.userId;
        if (!chatId)
            return next(new ErrorHandler("Please Provide ChatId", 400));
        const chat = await Chat.findById(chatId);
        if (!chat)
            return next(new ErrorHandler("No Chats Found!", 400));
        if (!chat.members.includes(userId))
            return next(new ErrorHandler("You are Not Allowed to Access this Chat", 401));
        const [messages, totalMessagesCount] = await Promise.all([
            Message.find({ chat: chatId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({
                path: "sender",
                model: "User",
                select: ["avatar", "username"],
            })
                .lean(),
            Message.countDocuments({ chat: chatId }),
        ]);
        const totalPages = Math.ceil(totalMessagesCount / limit);
        return res.status(200).json({
            success: true,
            message: "Retrieved All Messages",
            data: {
                messages: messages.reverse(),
                totalPages,
            },
        });
    }
    catch (error) {
        console.log(error);
        return next(new ErrorHandler("Internal Server Error", 500));
    }
};
export { newChatcontroller, getAllChats, getAllMessages };
