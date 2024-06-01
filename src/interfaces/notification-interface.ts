import mongoose from "mongoose";

export interface notificationInterface {
  userId: mongoose.Schema.Types.ObjectId;
  type: string;
  message: string;
  relatedUser: mongoose.Types.ObjectId;
  postId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
