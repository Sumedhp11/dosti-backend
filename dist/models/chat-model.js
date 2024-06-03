import mongoose from "mongoose";
const chatSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    isGroupChat: {
        type: Boolean,
        default: false,
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
}, { timestamps: true });
const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
