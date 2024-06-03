import { NextFunction, Response } from "express";
import { AuthenticatedInterface } from "../middleware/isAuthenticated.js";
import { ErrorHandler } from "../utils/ErrorClass.js";
import Chat from "../models/chat-model.js";

const newChatcontroller = async (
  req: AuthenticatedInterface,
  res: Response,
  next: NextFunction
) => {
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
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export { newChatcontroller };
