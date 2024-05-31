import { Schema } from "mongoose";

export interface postsInterface {
  _id?: Schema.Types.ObjectId;
  caption: string;
  content: string;
  likes: Schema.Types.ObjectId[];
  comments: [
    {
      userId: Schema.Types.ObjectId;
      comment: string;
      createdAt: Date;
      updatedAt: Date;
    }
  ];
  createdAt: Date;
  updatedAt: Date;
  userId: Schema.Types.ObjectId;
}
