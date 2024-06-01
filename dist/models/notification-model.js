import mongoose, { Schema } from "mongoose";
const notificationSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: ["Friend_Request", "Post_Interaction"],
        required: true,
    },
    relatedUser: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    postId: {
        type: Schema.Types.ObjectId,
        ref: "Posts",
    },
    message: {
        type: String,
        required: true,
    },
}, { timestamps: true });
const Notifications = mongoose.model("Notification", notificationSchema);
export default Notifications;
