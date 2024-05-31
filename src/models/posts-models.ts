import mongoose, { Schema } from "mongoose";
import { postsInterface } from "../interfaces/post-interface.js";
const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: String,
  },
  { timestamps: true }
);
const postsSchema = new mongoose.Schema<postsInterface>(
  {
    caption: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comments: [commentSchema],
  },
  { timestamps: true }
);

const Posts = mongoose.model("Posts", postsSchema);

export default Posts;
