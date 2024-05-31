import { Schema } from "mongoose";

export interface PostInterface {
  userId: Schema.Types.ObjectId;
  comment: String;
  createdAt?: Date;
  updatedAt?: Date;
}
