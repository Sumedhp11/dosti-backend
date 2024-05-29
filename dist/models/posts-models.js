import mongoose, { Schema } from "mongoose";
const commentSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    comment: String,
}, { timestamps: true });
const postsSchema = new mongoose.Schema({
    caption: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    likes: {
        type: Number,
        default: 0,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    comments: [commentSchema],
}, { timestamps: true });
const Posts = mongoose.model("Posts", postsSchema);
export default Posts;
