import mongoose from "mongoose";
import { messageInterface } from "../interfaces/message-interface.js";

const messageSchema = new mongoose.Schema<messageInterface>(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
    },
  },
  { timestamps: true }
);
const Message = mongoose.model("Message", messageSchema);
export default Message;
