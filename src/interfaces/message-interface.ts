import { Schema } from "mongoose";

export interface messageInterface {
  content: string;
  sender: Schema.Types.ObjectId;
  chat: Schema.Types.ObjectId;
}
